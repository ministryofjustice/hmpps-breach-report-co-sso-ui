import { Router } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import AuditService, { Page } from '../services/auditService'

import CommonUtils from '../services/commonUtils'
import { ErrorMessages } from '../data/uiModels'
import { handleIntegrationErrors } from '../utils/utils'
import CossoApiClient, { Cosso, CossoAddress } from '../data/cossoApiClient'

export default function addAddressRoutes(
  router: Router,
  auditService: AuditService,
  authenticationClient: AuthenticationClient,
  commonUtils: CommonUtils,
): Router {
  const currentPage = 'sign-and-send'

  router.get('/add-address/:id', async (req, res) => {
    await auditService.logPageView(Page.ADD_ADDRESS, { who: res.locals.user.username, correlationId: req.id })
    const cossoId: string = req.params.id
    const cossoApiClient = new CossoApiClient(authenticationClient)

    let cosso: Cosso = null
    try {
      cosso = await cossoApiClient.getCossoById(cossoId, res.locals.user.username)
    } catch (error) {
      const errorMessages: ErrorMessages = handleIntegrationErrors(error.status, error.data?.message, 'Suicide Risk')
      const showEmbeddedError = true
      res.render(`pages/add-address`, { errorMessages, showEmbeddedError })
      return
    }

    if (await commonUtils.redirectRequired(cosso, cossoId, res, authenticationClient)) return

    res.render('pages/add-address', {
      cosso,
      currentPage,
      cossoId,
    })
  })

  router.post('/add-address/:id', async (req, res) => {
    const cossoApiClient = new CossoApiClient(authenticationClient)

    const cossoId: string = req.params.id
    let cosso: Cosso = null

    try {
      cosso = await cossoApiClient.getCossoById(cossoId, res.locals.user.username)
    } catch (error) {
      const errorMessages: ErrorMessages = handleIntegrationErrors(error.status, error.data?.message, 'Suicide Risk')
      const showEmbeddedError = true
      res.render(`pages/add-address`, { errorMessages, showEmbeddedError })
      return
    }

    if (cosso.workAddress == null) {
      cosso.workAddress = {
        addressId: null,
        buildingName: null,
        buildingNumber: null,
        officeDescription: null,
        county: null,
        status: null,
        streetName: null,
        district: null,
        postcode: null,
        townCity: null,
      }
    }

    cosso.workAddress.officeDescription = req.body.officeDescription
    cosso.workAddress.buildingNumber = req.body.buildingNumber
    cosso.workAddress.buildingName = req.body.buildingName
    cosso.workAddress.streetName = req.body.streetName
    cosso.workAddress.district = req.body.district
    cosso.workAddress.townCity = req.body.townCity
    cosso.workAddress.county = req.body.county
    cosso.workAddress.postcode = req.body.postcode

    const errorMessages: ErrorMessages = validateAddress(cosso.workAddress)
    const hasErrors: boolean = Object.keys(errorMessages).length > 0

    if (!hasErrors) {
      try {
        await cossoApiClient.updateCosso(req.params.id, cosso, res.locals.user.username)
        res.redirect(`/witness-details/${req.params.id}`)
      } catch (error) {
        const integrationErrorMessages = handleIntegrationErrors(error.status, error.data?.message, 'Breach Notice')
        const showEmbeddedError = true
        // always stay on page and display the error when there are isssues retrieving the breach notice
        res.render(`pages/add-address`, { errorMessages, showEmbeddedError, integrationErrorMessages })
      }
    } else {
      res.render('pages/add-address', { errorMessages, cosso, currentPage, cossoId })
    }
  })

  function validateAddress(address: CossoAddress): ErrorMessages {
    let errorMessages: ErrorMessages = {}
    if (
      (!address.officeDescription || address.officeDescription.trim() === '') &&
      (!address.buildingName || address.buildingName.trim() === '') &&
      (!address.buildingNumber || address.buildingNumber.trim() === '')
    ) {
      errorMessages.identifier = {
        text: 'At least 1 out of [Description, Building Name, Address Number] must be present',
      }
    }

    if (!address.streetName || address.streetName.trim() === '') {
      errorMessages.streetName = {
        text: 'Street Name : This is a required value, please enter a value',
      }
    }

    if (!address.townCity || address.townCity.trim() === '') {
      errorMessages.townCity = {
        text: 'Town/City : This is a required value, please enter a value',
      }
    }

    if (!address.postcode || address.postcode.trim() === '') {
      errorMessages.postcode = {
        text: 'Postcode : This is a required value, please enter a value',
      }
    }

    errorMessages = validateLength(address.officeDescription, 'officeDescription', 'Office Description', errorMessages)
    errorMessages = validateLength(address.buildingName, 'buildingName', 'Building Name', errorMessages)
    errorMessages = validateLength(address.buildingNumber, 'buildingNumber', 'Address Number', errorMessages)
    errorMessages = validateLength(address.streetName, 'streetName', 'Street Name', errorMessages)
    errorMessages = validateLength(address.district, 'district', 'District', errorMessages)
    errorMessages = validateLength(address.townCity, 'townCity', 'Town or City', errorMessages)
    errorMessages = validateLength(address.county, 'county', 'County', errorMessages)
    errorMessages = validateLength(address.postcode, 'postcode', 'Postcode', errorMessages)

    return errorMessages
  }

  function validateLength(
    fieldValue: string,
    fieldName: keyof typeof FIELD_LIMITS,
    label: string,
    errorMessages: ErrorMessages,
  ): ErrorMessages {
    const maxLength = FIELD_LIMITS[fieldName]
    if (!fieldValue) return errorMessages

    if (fieldValue.trim().length > maxLength) {
      return {
        ...errorMessages,
        [fieldName]: {
          text: `Please enter ${maxLength} characters or less for ${label}`,
        },
      }
    }

    return errorMessages
  }

  const FIELD_LIMITS = {
    officeDescription: 50,
    buildingName: 35,
    buildingNumber: 35,
    streetName: 35,
    district: 35,
    townCity: 35,
    county: 35,
    postcode: 8,
  }

  return router
}

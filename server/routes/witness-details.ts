import { Router } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import AuditService, { Page } from '../services/auditService'
import CossoApiClient, { Cosso, ScreenInformation } from '../data/cossoApiClient'
import CommonUtils from '../services/commonUtils'
import { ErrorMessages, SelectItem } from '../data/uiModels'
import {
  arrangeSelectItemListAlphabetically,
  formatAddressForSelectMenuDisplay,
  formatFullName,
  handleIntegrationErrors,
  toCossoAddress,
} from '../utils/utils'
import NDeliusIntegrationApiClient, { DeliusAddress, WitnessDetails } from '../data/ndeliusIntegrationApiClient'

export default function witnessDetailsRoutes(
  router: Router,
  auditService: AuditService,
  authenticationClient: AuthenticationClient,
  commonUtils: CommonUtils,
): Router {
  const currentPage = 'witness-details'

  router.get('/witness-details/:id', async (req, res) => {
    await auditService.logPageView(Page.WITNESS_DETAILS, { who: res.locals.user.username, correlationId: req.id })
    const cossoClient = new CossoApiClient(authenticationClient)
    const ndeliusIntegrationApiClient = new NDeliusIntegrationApiClient(authenticationClient)
    const cossoId: string = req.params.id
    let errorMessages: ErrorMessages = {}
    let cosso: Cosso = null
    let witnessDetails: WitnessDetails = null
    let screenInfo: ScreenInformation[] = null

    try {
      cosso = await cossoClient.getCossoById(cossoId, res.locals.user.username)
      if (Object.keys(cosso).length === 0) {
        errorMessages.genericErrorMessage = {
          text: 'The document has not been found or has been deleted. An error has been logged. 404',
        }
        res.render(`pages/detailed-error`, { errorMessages })
        return
      }
      screenInfo = await cossoClient.getScreenInformationForScreen('witness_details', res.locals.user.username)
    } catch (error) {
      errorMessages = handleIntegrationErrors(
        error?.responseStatus,
        error?.data?.userMessage,
        'Breach Report CO SSO',
      )

      // Navigate to the detailed error page on 400
      if (error?.responseStatus === 400) {
        res.render(`pages/detailed-error`, { errorMessages })
        return
      }

      // Navigate to the detailed error page on 404
      if (error?.responseStatus === 404) {
        res.render(`pages/detailed-error`, { errorMessages })
        return
      }

      const showEmbeddedError = true
      res.render(`pages/failures`, { errorMessages, showEmbeddedError })
      return
    }

    try {
      witnessDetails = await ndeliusIntegrationApiClient.getWitnessDetails(cosso.crn, res.locals.user.username)
    } catch (error) {
      errorMessages = handleIntegrationErrors(
        error.responseStatus,
        error.data?.message,
        'NDelius Integration',
      )

      // take the user to detailed error page for 400 type errors
      if (error.responseStatus === 400) {
        res.render(`pages/detailed-error`, { errorMessages })
        return
      }

      // stay on the current page for 500 errors
      if (error.responseStatus === 500) {
        const showEmbeddedError = true
        res.render(`pages/witness-details`, { errorMessages, showEmbeddedError })
        return
      }
      res.render(`pages/detailed-error`, { errorMessages })
      return
    }

    if (await commonUtils.redirectRequired(cosso, cossoId, res, authenticationClient)) return

    let defaultAddress: DeliusAddress = null
    if (cosso.workAddress == null && witnessDetails.replyAddresses != null) {
      defaultAddress = witnessDetails.replyAddresses.find(record => record.status === 'Default')

      if (defaultAddress) {
        cosso.workAddress = toCossoAddress(defaultAddress)
      }
    }

    let addressNotAvailable: boolean = false
    if (cosso.workAddress != null && cosso.workAddress.addressId != null && witnessDetails.replyAddresses != null) {
      const addressPresent = witnessDetails.replyAddresses.find(record => record.id === cosso.workAddress.addressId)
      if (addressPresent == null) {
        cosso.workAddress = null
        addressNotAvailable = true
        await cossoClient.updateCosso(req.params.id, cosso, res.locals.user.username)

        errorMessages.genericErrorMessage = {
          text: 'Work Location and Address: The previously selected address is no longer available. Please select an alternative.',
        }
      }
    }

    let manualAddressAllowed: boolean = false
    if (witnessDetails.replyAddresses == null || witnessDetails.replyAddresses.length === 0) {
      manualAddressAllowed = true
    }

    const alternateAddressOptions = addressListToSelectItemList(
      witnessDetails.replyAddresses,
      cosso.roAndWitnessDetailsSaved,
      cosso.workAddress?.addressId,
    )

    witnessDetails.replyAddresses.sort((a, b) => a.buildingName.localeCompare(b.buildingName))
    // Sort addresses alphabetically

    res.render('pages/witness-details', {
      cosso,
      cossoId,
      currentPage,
      roName: formatFullName(witnessDetails.name),
      witnessAvailabilityHelp: screenInfo.find(si => si.fieldName === 'witness_availability')?.fieldText,
      witnessDetails,
      addressNotAvailable,
      alternateAddressOptions,
      manualAddressAllowed,
      errorMessages,
    })
  })

  router.post('/witness-details/:id', async (req, res) => {
    await auditService.logPageView(Page.WITNESS_DETAILS, { who: res.locals.user.username, correlationId: req.id })
    const cossoClient = new CossoApiClient(authenticationClient)
    const ndeliusIntegrationApiClient = new NDeliusIntegrationApiClient(authenticationClient)
    const callingScreen: string = req.query.returnTo as string
    const cossoId: string = req.params.id
    let cosso: Cosso = null
    let witnessDetails: WitnessDetails = null
    let screenInfo: ScreenInformation[] = null

    try {
      cosso = await cossoClient.getCossoById(cossoId, res.locals.user.username)
      if (Object.keys(cosso).length === 0) {
        const errorMessages: ErrorMessages = {}
        errorMessages.genericErrorMessage = {
          text: 'The document has not been found or has been deleted. An error has been logged. 404',
        }
        res.render(`pages/detailed-error`, { errorMessages })
        return
      }
      screenInfo = await cossoClient.getScreenInformationForScreen('witness_details', res.locals.user.username)
    } catch (error) {
      const errorMessages: ErrorMessages = handleIntegrationErrors(
        error?.responseStatus,
        error?.data?.userMessage,
        'Breach Report CO SSO',
      )

      // Navigate to the detailed error page on 400
      if (error?.responseStatus === 400) {
        res.render(`pages/detailed-error`, { errorMessages })
        return
      }

      // Navigate to the detailed error page on 404
      if (error?.responseStatus === 404) {
        res.render(`pages/detailed-error`, { errorMessages })
        return
      }

      const showEmbeddedError = true
      res.render(`pages/failures`, { errorMessages, showEmbeddedError })
      return
    }

    try {
      witnessDetails = await ndeliusIntegrationApiClient.getWitnessDetails(cosso.crn, res.locals.user.username)
    } catch (error) {
      const errorMessages: ErrorMessages = handleIntegrationErrors(
        error.responseStatus,
        error.data?.message,
        'NDelius Integration',
      )

      // take the user to detailed error page for 400 type errors
      if (error.responseStatus === 400) {
        res.render(`pages/detailed-error`, { errorMessages })
        return
      }

      // stay on the current page for 500 errors
      if (error.responseStatus === 500) {
        const showEmbeddedError = true
        res.render(`pages/witness-details`, { errorMessages, showEmbeddedError })
        return
      }
      res.render(`pages/detailed-error`, { errorMessages })
      return
    }

    if (await commonUtils.redirectRequired(cosso, cossoId, res, authenticationClient)) return

    cosso.roAndWitnessDetailsSaved = true
    cosso.witnessAvailability = req.body.witnessAvailability
    // Validation when use
    const errorMessages: ErrorMessages = validateFailures(cosso)
    const hasErrors: boolean = Object.keys(errorMessages).length > 0

    if (!hasErrors) {
      cosso.probationArea = witnessDetails.probationArea.description
      cosso.roTitleAndFullName = formatFullName(witnessDetails.name)
      cosso.roTelephoneNumber = witnessDetails.telephoneNumber
      cosso.roEmailAddress = witnessDetails.emailAddress
      cosso = handleSelectedAddress(cosso, witnessDetails, req.body.alternateAddress)

      await cossoClient.updateCosso(cossoId, cosso, res.locals.user.username)
      if (req.body.action === 'saveProgressAndClose') {
        res.send(
          `<p>You can now safely close this window</p><script nonce="${res.locals.cspNonce}">window.close()</script>`,
        )
      } else if (callingScreen && callingScreen === 'check-your-report') {
        res.redirect(`/check-your-report/${req.params.id}`)
      } else {
        res.redirect(`/offence-details/${cossoId}`)
      }
    } else {
      let defaultAddress: DeliusAddress = null
      if (cosso.workAddress == null && witnessDetails.replyAddresses != null) {
        defaultAddress = witnessDetails.replyAddresses.find(record => record.status === 'Default')

        if (defaultAddress) {
          cosso.workAddress = toCossoAddress(defaultAddress)
        }
      }

      let addressNotAvailable: boolean = false
      if (cosso.workAddress != null && cosso.workAddress.addressId != null && witnessDetails.replyAddresses != null) {
        const addressPresent = witnessDetails.replyAddresses.find(record => record.id === cosso.workAddress.addressId)
        if (addressPresent == null) {
          cosso.workAddress = null
          addressNotAvailable = true
          await cossoClient.updateCosso(req.params.id, cosso, res.locals.user.username)

          errorMessages.genericErrorMessage = {
            text: 'Work Location and Address: The previously selected address is no longer available. Please select an alternative.',
          }
        }
      }

      let manualAddressAllowed: boolean = false
      if (witnessDetails.replyAddresses == null || witnessDetails.replyAddresses.length === 0) {
        manualAddressAllowed = true
      }

      const alternateAddressOptions = addressListToSelectItemList(
        witnessDetails.replyAddresses,
        cosso.roAndWitnessDetailsSaved,
        req.body.alternateAddress,
      )

      witnessDetails.replyAddresses.sort((a, b) => a.buildingName.localeCompare(b.buildingName))

      res.render('pages/witness-details', {
        errorMessages,
        cosso,
        cossoId,
        currentPage,
        witnessDetails,
        callingScreen,
        manualAddressAllowed,
        alternateAddressOptions,
        addressNotAvailable,
        roName: formatFullName(witnessDetails.name),
        displayAlternate: req.body.offenderAddressSelectOne === 'No',
        witnessAvailability: screenInfo.find(si => si.fieldName === 'witness_availability')?.fieldText,
      })
    }
  })

  function validateFailures(cosso: Cosso): ErrorMessages {
    const errorMessages: ErrorMessages = {}

    if (cosso.witnessAvailability && cosso.witnessAvailability.length > 20000) {
      errorMessages.witnessAvailability = {
        text: 'Witness Availability: This field must be 20000 characters or less',
      }
    }

    return errorMessages
  }

  function handleSelectedAddress(cosso: Cosso, witnessDetails: WitnessDetails, addressIdentifier: string): Cosso {
    const co = cosso
    const selectedAddress = getSelectedAddress(witnessDetails.replyAddresses, addressIdentifier)
    if (selectedAddress) {
      co.workAddress = toCossoAddress(selectedAddress)
    }
    return co
  }

  function getSelectedAddress(addressList: DeliusAddress[], addressIdentifier: string): DeliusAddress {
    const addressIdentifierNumber: number = +addressIdentifier
    return addressList.find(address => address.id === addressIdentifierNumber)
  }

  function addressListToSelectItemList(
    addresses: DeliusAddress[],
    witnessDetailsSaved: boolean,
    selectedAddressId: number,
  ): SelectItem[] {
    const returnAddressList: SelectItem[] = [
      {
        text: 'Please Select',
        value: '-1',
        selected: !witnessDetailsSaved,
      },
    ]
    if (addresses) {
      const orderedAddressList: SelectItem[] = arrangeSelectItemListAlphabetically(
        addresses.map(address => ({
          text: formatAddressForSelectMenuDisplay(address),
          value: `${address.id}`,
          selected: witnessDetailsSaved && address.id.toString() === selectedAddressId.toString(),
        })),
      )

      returnAddressList.push(...orderedAddressList)
    }

    return returnAddressList
  }

  return router
}

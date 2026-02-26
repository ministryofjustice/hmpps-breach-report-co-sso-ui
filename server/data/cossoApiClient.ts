import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { ZonedDateTime } from '@js-joda/core'
import { AuthenticationClient } from '@ministryofjustice/hmpps-rest-client/dist/main'
import config from '../config'
import logger from '../../logger'

export default class CossoApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Cosso API', config.apis.cosso, logger, authenticationClient)
  }

  async getCossoById(uuid: string, username: string): Promise<Cosso> {
    return this.get(
      {
        path: `/cosso/${uuid}`,
      },
      asSystem(username),
    )
  }

  async updateCosso(id: string, cosso: Cosso, username: string) {
    await this.put(
      {
        path: `/cosso/${id}`,
        data: cosso as unknown as Record<string, unknown>,
      },
      asSystem(username),
    )
  }

  async getAmendmentById(uuid: string, username: string): Promise<CossoAmendment> {
    return this.get(
      {
        path: `/cosso/amendment/${uuid}`,
      },
      asSystem(username),
    )
  }

  async updateAmendment(id: string, amendment: CossoAmendment, username: string) {
    await this.put(
      {
        path: `/cosso/amendment/${id}`,
        data: amendment as unknown as Record<string, unknown>,
      },
      asSystem(username),
    )
  }

  async createAmendment(amendment: CossoAmendment, username: string): Promise<string> {
    return this.post(
      {
        path: `/cosso/amendment`,
        data: amendment as unknown as Record<string, unknown>,
      },
      asSystem(username),
    )
  }

  async createCossoContact(cossoContact: CossoContact, username: string): Promise<string> {
    return this.post(
      {
        path: `/cosso/contact`,
        data: cossoContact as unknown as Record<string, unknown>,
      },
      asSystem(username),
    )
  }

  async updateCossoContact(cossoContact: CossoContact, username: string) {
    return this.put(
      {
        path: `/cosso/contact/${cossoContact.id}`,
        data: cossoContact as unknown as Record<string, unknown>,
      },
      asSystem(username),
    )
  }

  async deleteContact(id: string, username: string) {
    return this.delete(
      {
        path: `/cosso/contact/${id}`,
      },
      asSystem(username),
    )
  }

  async batchUpdateContacts(cossoId: string, contacts: Array<CossoContact>, username: string): Promise<void> {
    const promises = []
    for (const contact of contacts) {
      if (contact.id) {
        promises.push(this.updateCossoContact(contact, username))
      } else {
        promises.push(this.createCossoContact(contact, username))
      }
    }
    await Promise.all(promises)
  }

  async batchDeleteContacts(contacts: Array<CossoContact>, username: string): Promise<void> {
    const promises = []
    for (const contact of contacts) {
      promises.push(this.deleteContact(contact.id, username))
    }
    await Promise.all(promises)
  }

  async getCossoContactsForCosso(id: string, username: string): Promise<Array<CossoContact>> {
    return this.get(
      {
        path: `/cosso/contact/bycossoid/${id}`,
      },
      asSystem(username),
    )
  }

  async getScreenInformationForScreen(screen: string, username: string): Promise<Array<ScreenInformation>> {
    return this.get(
      {
        path: `/cosso/referencedata/screeninformation/${screen}`,
      },
      asSystem(username),
    )
  }

  async getDraftPdfById(uuid: string, username: string): Promise<ArrayBuffer> {
    return this.get(
      {
        path: `/cosso/${uuid}/pdf`,
        responseType: 'arraybuffer',
      },
      asSystem(username),
    )
  }

  async deleteCosso(cossoId: string, username: string) {
    return this.delete(
      {
        path: `/cosso/${cossoId}`,
      },
      asSystem(username),
    )
  }
}

export interface Cosso {
  id: string
  crn: string
  dateOfBirth: string
  completedDate: ZonedDateTime
  titleAndFullName: string
  telephoneNumber: string
  emailAddress: string
  mobileNumber: string
  postalAddress: CossoAddress
  basicDetailsSaved: boolean
  roTitleAndFullName: string
  roTelephoneNumber: string
  roEmailAddress: string
  witnessAvailability: string
  workAddress: CossoAddress
  roAndWitnessDetailsSaved: boolean
  mainOffence: string
  sentencingCourt: string
  sentenceDate: string
  sentenceType: string
  sentenceLength: string
  requirementList: CossoRequirement[]
  amendments: CossoAmendment[]
  cossoContactList: CossoContact[]
  whyInBreach: string
  stepsToPreventBreach: string
  complianceToDate: string
  riskHistory: string
  confirmEqualities: boolean
  recommendations: string
  supportingComments: string
  riskOfHarmChanged: boolean
  failuresAndEnforcementSaved: boolean
  offenceDetailsSaved: boolean
  diversityConfirmation: boolean
  signature: string
}

export interface CossoAddress {
  id?: string
  addressId: number
  status: string
  officeDescription?: string
  buildingName: string
  buildingNumber: string
  streetName: string
  townCity: string
  district: string
  county: string
  postcode: string
}

export interface CossoAmendment {
  id?: string
  cossoId: string
  amendmentDetails: string
  amendmentReason: string
  amendmentDate: string
}

export interface CossoContact {
  id?: string
  cossoId: string
  deliusContactId: number
  contactTypeDescription: string
}

export interface ScreenInformation {
  screenName: string
  fieldName: string
  fieldText: string
}

export interface CossoRequirement {
  id?: string
  deliusRequirementId: number
  cossoId: string
  requirementTypeMainCategoryDescription: string
  requirementTypeSubCategoryDescription: string
  requirementLength: string
  requirementSecondLength: string
}

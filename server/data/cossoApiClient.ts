import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
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

  async deleteAmendment(amendmentId: string, username: string): Promise<Cosso> {
    return this.delete(
      {
        path: `/cosso/amendment/${amendmentId}`,
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

  async deleteContact(id: string | null | undefined, username: string) {
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

  async getCossoRequirementsForCosso(id: string, username: string): Promise<Array<CossoRequirement>> {
    return this.get(
      {
        path: `/cosso/requirement/bycossoid/${id}`,
      },
      asSystem(username),
    )
  }

  async createCossoRequirement(cossoRequirement: CossoRequirement, username: string): Promise<string> {
    return this.post(
      {
        path: `/cosso/requirement`,
        data: cossoRequirement as unknown as Record<string, unknown>,
      },
      asSystem(username),
    )
  }

  async updateCossoRequirement(cossoRequirement: CossoRequirement, username: string): Promise<string> {
    return this.put(
      {
        path: `/cosso/requirement/${cossoRequirement.id}`,
        data: cossoRequirement as unknown as Record<string, unknown>,
      },
      asSystem(username),
    )
  }

  async deleteCossoRequirement(id: string | undefined, username: string) {
    return this.delete(
      {
        path: `/cosso/requirement/${id}`,
      },
      asSystem(username),
    )
  }

  async batchUpdateRequirements(cossoId: string, reqs: Array<CossoRequirement>, username: string): Promise<void> {
    const promises = []
    for (const r of reqs) {
      if (r.id) promises.push(this.updateCossoRequirement(r, username))
      else promises.push(this.createCossoRequirement(r, username))
    }
    await Promise.all(promises)
  }

  async batchDeleteRequirements(reqs: Array<CossoRequirement>, username: string): Promise<void> {
    const promises = []
    for (const r of reqs) {
      promises.push(this.deleteCossoRequirement(r.id!, username))
    }
    await Promise.all(promises)
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

  async publishCosso(id: string, username: string) {
    await this.post(
      {
        path: `/cosso/publish/${id}`,
      },
      asSystem(username),
    )
  }
}

export interface Cosso {
  id: string
  crn: string
  dateOfBirth: string
  completedDate: string
  titleAndFullName: string
  telephoneNumber: string
  emailAddress: string
  mobileNumber: string
  postalAddress: CossoAddress | null | undefined
  basicDetailsSaved: boolean
  roTitleAndFullName: string
  roTelephoneNumber: string
  roEmailAddress: string
  witnessAvailability: string
  workAddress: CossoAddress | null | undefined
  roAndWitnessDetailsSaved: boolean
  mainOffence: string
  additionalOffence: string
  sentencingCourt: string
  sentenceDate: string
  sentenceType: string
  sentenceLength: string
  lengthUnits: string
  suspendedCustodyLength: string
  requirementList: CossoRequirement[]
  amendments: CossoAmendment[]
  cossoContactList: CossoContact[]
  whyInBreach: string
  stepsToPreventBreach: string
  complianceToDate: string
  complianceToDateSaved: boolean
  riskHistory: string
  confirmEqualities: boolean
  recommendations: string
  supportingComments: string
  riskOfHarmChanged: boolean
  failuresAndEnforcementSaved: boolean
  offenceDetailsSaved: boolean
  probationArea: string | null | undefined
  diversityConfirmation: boolean
  signature: string | null
  signAndSendSaved: boolean | null
  sheetSentBy: string | null
  signedByRo: boolean | null
  terminated: boolean
  terminatedUnterminatedDate: Date
}

export interface CossoAddress {
  id?: string | null | undefined
  addressId: number | null | undefined
  status: string | null | undefined
  officeDescription?: string | null | undefined
  buildingName: string | null | undefined
  addressNumber: string | null | undefined
  streetName: string | null | undefined
  townCity: string | null | undefined
  district: string | null | undefined
  county: string | null | undefined
  postcode: string | null | undefined
}

export interface CossoAmendment {
  id?: string
  cossoId: string
  amendmentDetails: string | null
  amendmentReason: string | null
  amendmentDate: string | null
}

export interface CossoContact {
  id?: string
  cossoId: string
  deliusContactId: number | undefined
  contactTypeDescription: string | null | undefined
  contactPerson: string | null
  contactLocation: CossoAddress | null
  contactDate: string
  contactOutcome: string | undefined | null
  formSent: string | null
}

export interface ScreenInformation {
  screenName: string
  fieldName: string
  fieldText: string
}

export interface CossoRequirement {
  id?: string | undefined | null
  deliusRequirementId: number
  cossoId: string
  requirementTypeMainCategoryDescription: string
  requirementTypeSubCategoryDescription: string
  requirementLength: string
  requirementSecondLength?: string | null
  failureReason?: string | undefined | null
  notes?: string
  failure?: boolean | undefined | null
}

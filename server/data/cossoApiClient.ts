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

  async getDraftPdfById(uuid: string, username: string): Promise<ArrayBuffer> {
    return this.get(
      {
        path: `/cosso/${uuid}/pdf`,
        responseType: 'arraybuffer',
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
  whyInBreach: string
  stepsToPreventBreach: string
  riskOfHarmChanged: boolean
  riskHistory: string
  diversityConfirmation: boolean
  recommendations: string
  supportingComments: string
  complianceToDate: string
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

export interface CossoRequirement {
  id?: string
  deliusRequirementId: number
  cossoId: string
  requirementTypeMainCategoryDescription: string
  requirementTypeSubCategoryDescription: string
  requirementLength: string
  requirementSecondLength: string
}

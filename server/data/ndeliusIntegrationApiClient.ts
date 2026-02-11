import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { LocalDate } from '@js-joda/core'
import config from '../config'
import logger from '../../logger'

export default class NDeliusIntegrationApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('NDelius Integration API', config.apis.ndeliusIntegration, logger, authenticationClient)
  }

  async getLimitedAccessCheck(crn: string, username: string): Promise<LimitedAccessCheck> {
    return this.get(
      {
        path: `/users/${username}/access/${crn}`,
      },
      asSystem(username),
    )
  }

  async getBasicDetails(crn: string, username: string): Promise<BasicDetails> {
    return this.get(
      {
        path: `/basic-details/${crn}/${username}`,
      },
      asSystem(username),
    )
  }

  async getOffenceDetails(crn: string, username: string): Promise<OffenceDetails> {
    return this.get(
      {
        path: `/offence-details/${crn}/${username}`,
      },
      asSystem(username),
    )
  }

  async getFailures(crn: string, username: string): Promise<Failures> {
    return this.get(
      {
        path: `/failures-enforcements/${crn}/${username}`,
      },
      asSystem(username),
    )
  }
}

export interface Name {
  forename: string
  middleName: string
  surname: string
}

export interface BasicDetails {
  title: string
  name: Name
  addresses: DeliusAddress[]
  dateOfBirth: string
  prisonNumber: string
  emailAddress: string
  mobileNumber: string
  telephoneNumber: string
}

export interface DeliusAddress {
  id: number
  status: string
  officeDescription?: string
  buildingName: string
  buildingNumber: string
  streetName: string
  townCity: string
  district: string
  county: string
  postcode: string
  startDate: string
}

export interface LimitedAccessCheck {
  crn: string
  userExcluded: boolean
  exclusionMessage?: string
  userRestricted: boolean
  restrictionMessage?: string
}

export interface ReferenceData {
  code: string
  description: string
}

export interface EnforceableContact {
  id: number
  datetime: string
  description: string
  type: ReferenceData
  outcome: ReferenceData
  notes: string
}

export interface Registration {
  id: number
  type: ReferenceData
  level: ReferenceData
  category: ReferenceData
  startDate: string
  endDate: string
  notes: string
  documentsLinked: boolean
  deregistered: boolean
}

export interface Failures {
  enforceableContacts: EnforceableContact[]
  registrations: Registration[]
}

export interface DeliusRequirement {
  id: number
  startDate: LocalDate
  requirementTypeMainCategoryDescription: string
  requirementLength: number
  requirementLengthUnits: string
  requirementTypeSubCategoryDescription: string
  secondaryRequirementLength: number
  secondaryRequirementLengthUnits: string
}

export interface DeliusSentence {
  length: number
  lengthUnits: string
  type: string
  subtype: string
  secondLength: number
  secondLengthUnits: string
}

export interface OffenceDetails {
  mainOffence: ReferenceData
  additionalOffences: ReferenceData[]
  sentencingCourt: string
  sentenceDate: LocalDate
  sentenceImposed: ReferenceData
  suspendedCustodyLength: DeliusSentence
  requirementsImposed: DeliusRequirement[]
  sentence: DeliusSentence
  additionalSentences: DeliusSentence[]
}

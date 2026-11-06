import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { LocalDate } from '@js-joda/core'
import config from '../config'
import logger from '../../logger'

export default class NDeliusIntegrationApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('NDelius Integration API', config.apis.ndeliusIntegration, logger, authenticationClient)
  }

  async getBasicDetails(crn: string, username: string): Promise<BasicDetails> {
    return this.get(
      {
        path: `/basic-details/${crn}/${username}`,
      },
      asSystem(username),
    )
  }

  async getOffenceDetails(uuid: string, username: string): Promise<OffenceDetails> {
    return this.get(
      {
        path: `/offence-details/${uuid}`,
      },
      asSystem(username),
    )
  }

  async getFailures(crn: string, uuid: string, username: string): Promise<Failures> {
    return this.get(
      {
        path: `/failures-enforcements/${crn}/${uuid}`,
      },
      asSystem(username),
    )
  }

  async getWitnessDetails(crn: string, username: string): Promise<WitnessDetails> {
    return this.get(
      {
        path: `/responsible-officer/${crn}`,
      },
      asSystem(username),
    )
  }

  async getRequirements(breachNoticeId: string, username: string): Promise<Requirements> {
    return this.get(
      {
        path: `/requirements/${breachNoticeId}`,
      },
      asSystem(username),
    )
  }

  async getSignAndSendDetails(crn: string, username: string): Promise<SignAndSendDetails> {
    return this.get(
      {
        path: `/sign-and-send/${crn}/${username}`,
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
  id: number | null | undefined
  status: string | null | undefined
  officeDescription?: string | null | undefined
  buildingName: string | null | undefined
  buildingNumber: string | null | undefined
  streetName: string | null | undefined
  townCity: string | null | undefined
  district: string | null | undefined
  county: string | null | undefined
  postcode: string | null | undefined
  startDate: string | null | undefined
}

export interface ReferenceData {
  code: string | null | undefined
  description: string | null | undefined
}

export interface UserDetails {
  forenames: string
  surname: string
}

export interface EnforceableContact {
  id: number | undefined
  datetime: string
  description: string | undefined | null
  type: ReferenceData
  outcome: ReferenceData
  notes: string | null
}

export interface Registration {
  id: number
  type: ReferenceData
  level: ReferenceData
  category: ReferenceData
  startDate: string
  formattedStartDate: string
  endDate: string
  formattedEndDate: string
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
  mainCategory: string
  length: number
  lengthUnit: string
  subCategory: string
  secondaryLength: number
  secondaryLengthUnit: string
}

export interface DeliusSentence {
  length: number
  lengthUnits: string
  type: string
  subtype: string
  secondLength: number
  secondLengthUnits: string
}

export interface CustodyLength {
  length: number
  units: string
}

export interface DeliusAdditionalSentence {
  length: number
  amount: number
  notes: string
  type: ReferenceData
  units: ReferenceData
}

export interface OffenceDetails {
  mainOffence: ReferenceData
  additionalOffences: ReferenceData[]
  sentencingCourt: string
  sentenceDate: string
  sentenceImposed: ReferenceData
  suspendedCustodyLength: CustodyLength
  requirementsImposed: DeliusRequirement[]
  sentence: DeliusSentence
  additionalSentences: DeliusAdditionalSentence[]
}

export interface WitnessDetails {
  name: Name
  telephoneNumber: string
  emailAddress: string
  probationArea: ReferenceData
  replyAddresses: DeliusAddress[]
}

export interface Requirements {
  requirements: DeliusRequirement[]
  breachReasons: ReferenceData[]
}

export interface SignAndSendDetails {
  userDetails: UserDetails
}

export interface IntegrationError {
  responseStatus?: number
  data?: {
    message?: string
  }
}

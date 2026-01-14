import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { ZonedDateTime } from '@js-joda/core'
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
}

export interface Cosso {
  id: string
  crn: string
  completedDate: ZonedDateTime
  titleAndFullName: string
  telephoneNumber: string
  emailAddress: string
  mobileNumber: string
  postalAddress: CossoAddress
  dateOfBirth: string
  basicDetailsSaved: boolean
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

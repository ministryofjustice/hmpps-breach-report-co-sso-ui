import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
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
}

export interface Cosso {
  id: string
}

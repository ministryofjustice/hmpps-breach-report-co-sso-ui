import { DeliusAddress, Name } from '../data/ndeliusIntegrationApiClient'
import { ErrorMessages } from '../data/uiModels'
import { CossoAddress } from '../data/cossoApiClient'

const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const initialiseName = (fullName?: string): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}

export function formatTitleAndFullName(title: string, name: Name): string {
  return [title, name.forename, name.middleName, name.surname].filter(Boolean).join(' ')
}

export function findMainOrPostalAddressInAddressList(addressList: Array<DeliusAddress>): DeliusAddress {
  if (!Array.isArray(addressList) || addressList.length === 0) {
    return null
  }

  addressList.sort((a, b) => a.startDate && a.startDate.localeCompare(b.startDate)).reverse()

  return addressList.find(a => a.status === 'Postal') ?? addressList.find(a => a.status === 'Main') ?? null
}

export function handleIntegrationErrors(status: number, message: string, integrationService: string): ErrorMessages {
  const errorMessages: ErrorMessages = {}
  if (status === 400) {
    errorMessages.genericErrorMessage = {
      text: 'An unexpected 400 type error has occurred. Please contact the service desk and report this error.',
    }
    return errorMessages
  }
  if (status === 404) {
    errorMessages.genericErrorMessage = {
      text: 'The document has not been found or has been deleted. An error has been logged. 404',
    }
    return errorMessages
  }
  if (integrationService === 'NDelius Integration') {
    errorMessages.genericErrorMessage = {
      text: 'There has been a problem fetching information from NDelius. Please try again later.',
    }
  } else {
    errorMessages.genericErrorMessage = {
      text: 'There has been a problem fetching information from the Breach Report CO SSO Service. Please try again later.',
    }
  }

  return errorMessages
}

export function toCossoAddress(deliusAddress: DeliusAddress): CossoAddress {
  if (!deliusAddress) {
    return null
  }
  return {
    addressId: deliusAddress.id,
    status: deliusAddress.status,
    officeDescription: deliusAddress.officeDescription,
    buildingName: deliusAddress.buildingName,
    buildingNumber: deliusAddress.buildingNumber,
    streetName: deliusAddress.streetName,
    townCity: deliusAddress.townCity,
    district: deliusAddress.district,
    county: deliusAddress.county,
    postcode: deliusAddress.postcode,
  }
}

import { ParsedQs } from 'qs'
import { DeliusAddress, IntegrationError, Name } from '../data/ndeliusIntegrationApiClient'
import { ErrorMessages, SelectItem } from '../data/uiModels'

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

export function formatFullName(name: Name): string {
  return [name.forename, name.middleName, name.surname].filter(Boolean).join(' ')
}

export function findMainOrPostalAddressInAddressList(addressList: Array<DeliusAddress>) {
  if (!Array.isArray(addressList) || addressList.length === 0) {
    return null
  }

  const parseDate = (date?: string): number => (date ? Date.parse(date) || 0 : 0)
  const latestByStatus = (status: string): DeliusAddress =>
    addressList.filter(a => a.status === status).sort((a, b) => parseDate(b.startDate!) - parseDate(a.startDate!))[0]

  // Return the latest address from start date with the following priority for statuses:
  // Postal → Main → None (Displays No Fixed Abode)
  return latestByStatus('Postal') ?? latestByStatus('Main') ?? null
}

export function handleIntegrationErrors(error: unknown, integrationService: string): ErrorMessages {
  const httpError: IntegrationError = error as unknown as IntegrationError
  const status = httpError.responseStatus
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

export function toCossoAddress(deliusAddress: DeliusAddress | null) {
  if (!deliusAddress) {
    return null
  }
  return {
    addressId: deliusAddress.id,
    status: deliusAddress.status,
    officeDescription: deliusAddress.officeDescription,
    buildingName: deliusAddress.buildingName,
    addressNumber: deliusAddress.buildingNumber,
    streetName: deliusAddress.streetName,
    townCity: deliusAddress.townCity,
    district: deliusAddress.district,
    county: deliusAddress.county,
    postcode: deliusAddress.postcode,
  }
}

export default function asArray(param: undefined | string | ParsedQs | (string | ParsedQs)[]): string[] {
  if (param === undefined) return []
  return Array.isArray(param) ? (param as string[]) : [param as string]
}

export function formatAddressForSelectMenuDisplay(deliusAddress: DeliusAddress | null | undefined) {
  if (deliusAddress) {
    return [
      deliusAddress.officeDescription,
      deliusAddress.buildingName,
      [deliusAddress.buildingNumber, deliusAddress.streetName]
        .filter(item => item)
        .join(' ')
        .trim(),
      deliusAddress.district,
      deliusAddress.townCity,
      deliusAddress.county,
      deliusAddress.postcode,
    ]
      .filter(item => item)
      .join(', ')
  }
  return null
}

export function arrangeSelectItemListAlphabetically(selectItemsToSort: SelectItem[]): SelectItem[] {
  if (selectItemsToSort) {
    return selectItemsToSort.sort((a, b) => {
      const textA = a?.text ?? ''
      const textB = b?.text ?? ''
      return textA.localeCompare(textB, 'en', { numeric: true })
    })
  }
  return selectItemsToSort
}

export function createBlankCossoWithId(id: string) {
  return {
    amendments: [],
    basicDetailsSaved: false,
    completedDate: undefined,
    complianceToDate: '',
    confirmEqualities: false,
    cossoContactList: [],
    dateOfBirth: '',
    diversityConfirmation: false,
    emailAddress: '',
    failuresAndEnforcementSaved: false,
    id,
    mainOffence: '',
    additionalOffence: '',
    mobileNumber: '',
    offenceDetailsSaved: false,
    postalAddress: undefined,
    recommendations: '',
    requirementList: [],
    riskHistory: '',
    riskOfHarmChanged: false,
    roAndWitnessDetailsSaved: false,
    roEmailAddress: '',
    roTelephoneNumber: '',
    roTitleAndFullName: '',
    sentenceDate: '',
    sentenceLength: '',
    lengthUnits: '',
    sentenceType: '',
    suspendedCustodyLength: '',
    sentencingCourt: '',
    signature: '',
    stepsToPreventBreach: '',
    supportingComments: '',
    telephoneNumber: '',
    titleAndFullName: '',
    whyInBreach: '',
    witnessAvailability: '',
    workAddress: undefined,
    crn: '',
    probationArea: '',
    signAndSendSaved: false,
    sheetSentBy: '',
    signedByRo: false,
    complianceToDateSaved: false,
    terminated: false,
    terminatedUnterminatedDate: undefined,
  }
}

export function convertLineBreaks(str: string): string {
  return str.replace(/\r\n|\r/g, '\n')
}

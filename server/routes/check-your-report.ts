import {Router} from 'express'
import {AuthenticationClient} from '@ministryofjustice/hmpps-auth-clients'
import AuditService, {Page} from '../services/auditService'
import CossoApiClient, {Cosso} from '../data/cossoApiClient'
import CommonUtils from '../services/commonUtils'
import {toFullUserDate} from "../utils/dateUtils";

export default function checkYourReportRoutes(
  router: Router,
  auditService: AuditService,
  authenticationClient: AuthenticationClient,
  commonUtils: CommonUtils,
): Router {
  const currentPage = 'check-your-report'

  router.get('/check-your-report/:id', async (req, res) => {
    await auditService.logPageView(Page.CHECK_YOUR_REPORT, {who: res.locals.user.username, correlationId: req.id})
    const cossoClient = new CossoApiClient(authenticationClient)
    const cossoId: string = req.params.id
    const cosso: Cosso = await cossoClient.getCossoById(cossoId, res.locals.user.username)
    const dateOfBirth: string = toFullUserDate(cosso.dateOfBirth)
    const sentenceDate: string = toFullUserDate(cosso.sentenceDate)
    const reportValidated = validateReport(cosso)

    if (await commonUtils.redirectRequired(cosso, cossoId, res, authenticationClient)) return

    res.render('pages/check-your-report', {
      cosso,
      dateOfBirth,
      sentenceDate,
      cossoId,
      reportValidated,
      currentPage,
    })
  })

  function validateReport(cosso: Cosso): boolean {
    return (
      cosso.titleAndFullName?.trim().length > 0 &&
      cosso.crn?.trim().length > 0 &&
      cosso.postalAddress != null &&
      cosso.dateOfBirth?.trim().length > 0 &&
      cosso.roTitleAndFullName?.trim().length > 0 &&
      cosso.roTelephoneNumber?.trim().length > 0 &&
      cosso.roEmailAddress?.trim().length > 0 &&
      cosso.witnessAvailability?.trim().length > 0 &&
      cosso.workAddress != null &&
      cosso.mainOffence?.trim().length > 0 &&
      cosso.sentencingCourt?.trim().length > 0 &&
      cosso.sentenceDate?.trim().length > 0 &&
      cosso.sentenceType?.trim().length > 0 &&
      cosso.sentenceLength?.trim().length > 0 &&
      cosso.requirementList != null &&
      cosso.amendments != null &&
      cosso.whyInBreach?.trim().length > 0 &&
      cosso.stepsToPreventBreach?.trim().length > 0 &&
      cosso.riskOfHarmChanged != null &&
      cosso.riskHistory?.trim().length > 0 &&
      cosso.diversityConfirmation != null &&
      cosso.recommendations?.trim().length > 0 &&
      cosso.supportingComments?.trim().length > 0 &&
      cosso.complianceToDate?.trim().length > 0 &&
      cosso.signature?.trim().length > 0
    )
  }

  return router
}

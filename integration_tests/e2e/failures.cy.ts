context('Failures and Enforcement page', () => {
  it('can see fields with stored data', () => {
    cy.visit('/failures/dd88f738-f5f9-4ada-94e8-897b781e5db1')
    cy.url().should('include', '/failures')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Failures and Enforcement')
    cy.get('label[for="contact-0"]').should(
      'contain.text',
      '22/8/2025, Contact Type Description, Contact Outcome Description',
    )
    cy.get('#whyInBreach-hint .govuk-details__text').should('contain.text', 'Why In Breach Help Text')
    cy.get('#whyInBreach').should('contain.text', 'Why In Breach Test Text')
    cy.get('#stepsToPreventBreach-hint .govuk-details__text').should('contain.text', 'Preventative Steps Help Text')
    cy.get('#stepsToPreventBreach').should('contain.text', 'Preventative Steps Test Text')
    cy.get('#registration-1').should('contain.text', 'Type: Registration Code Description')
    cy.get('#registration-1').should('contain.text', 'Category: Registration Category Description')
    cy.get('#registration-1').should('contain.text', 'Level: Registration Level Description')
    cy.get('#registration-1').should('contain.text', 'Start Date:')
    cy.get('#registration-1').should('contain.text', 'End Date:')
    cy.get('input[name="riskOfHarmChanged"][value="true"]').should('be.checked')
    cy.get('input[name="riskOfHarmChanged"][value="false"]').should('not.be.checked')
    cy.get('#riskHistory-hint .govuk-details__text').should('contain.text', 'Risk of Serious Harm Help Text')
    cy.get('#riskHistory').should('contain.text', 'Heres why the risk has changed')
    cy.get('input[id="confirmationStatement"]').should('not.be.checked')
    cy.get('label[for="confirmationStatement"]').should(
      'contain.text',
      'I confirm that equalities and diversity information has been considered as part of preparing the report and recommendations',
    )
    cy.get('label[for="recommendationOptions"]').should('contain.text', 'The Order is continued')
    cy.get('input[name="recommendationOptions"][value="continued"]').should('be.checked')
    cy.get('label[for="recommendationOptions-2"]').should(
      'contain.text',
      'The community order is revoked and the person be re-sentenced',
    )
    cy.get('input[name="recommendationOptions"][value="revoked"]').should('not.be.checked')
    cy.get('label[for="recommendationOptions-3"]').should(
      'contain.text',
      'Custody is activated for the suspended sentence',
    )
    cy.get('input[name="recommendationOptions"][value="activated"]').should('not.be.checked')
    cy.get('#supportingComments-hint').should('contain.text', 'Recommendation Help Text')
    cy.get('#supportingComments').should('contain.text', 'Additional comments to Support recommendation')
  })

  it('can see fields on first time visit to page', () => {
    cy.visit('/failures/755df153-992c-4104-a094-42dc88e1a5f9')
    cy.url().should('include', '/failures')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Failures and Enforcement')
    cy.get('#whyInBreach').should('have.value', '')
    cy.get('#stepsToPreventBreach').should('have.value', '')
    cy.get('input[name="riskOfHarmChanged"][value="true"]').should('not.be.checked')
    cy.get('input[name="riskOfHarmChanged"][value="false"]').should('be.checked')
    cy.get('#riskHistory').should('have.value', '')
    cy.get('input[id="confirmationStatement"]').should('not.be.checked')
    cy.get('input[name="recommendationOptions"][value="continued"]').should('not.be.checked')
    cy.get('input[name="recommendationOptions"][value="revoked"]').should('not.be.checked')
    cy.get('input[name="recommendationOptions"][value="activated"]').should('not.be.checked')
    cy.get('#supportingComments').should('have.value', '')
  })

  it('can see buttons', () => {
    cy.visit('/failures/dd88f738-f5f9-4ada-94e8-897b781e5db1')
    cy.url().should('include', '/failures')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Failures and Enforcement')
    cy.get('#continue-button').should('contain.text', 'Continue')
    cy.get('#close-button').should('contain.text', 'Save Progress and Close')
  })

  it('can see Risk of Serious Harm text entry conditionally', () => {
    cy.visit('/failures/dd88f738-f5f9-4ada-94e8-897b781e5db1')
    cy.url().should('include', '/failures')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Failures and Enforcement')
    cy.get('input[name="riskOfHarmChanged"][value="false"]').click()
    cy.get('#riskHistory').should('exist')
    cy.get('#riskHistory').should('not.be.visible')
    cy.get('input[name="riskOfHarmChanged"][value="true"]').click()
    cy.get('#riskHistory').should('be.visible')
    cy.get('#riskHistory').should('contain.text', 'Heres why the risk has changed')
  })

  it('close button displays message', () => {
    cy.intercept('POST', '/failures/**').as('saveAndCloseRequest')
    cy.visit('/failures/8a5fca4c-f72d-4bae-8170-fbe069ed1aaf')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Failures and Enforcement')
    cy.get('#close-button').click()
    cy.wait('@saveAndCloseRequest').then(({ request }) => {
      const body = new URLSearchParams(request.body)
      expect(body.get('action')).to.equal('saveProgressAndClose')
    })
    cy.contains('You can now safely close this window').should('be.visible')
    cy.get('#page-title').should('not.exist')
  })

  it('continue button redirects to compliance page', () => {
    cy.intercept('POST', '/failures/**').as('formSubmit')
    cy.visit('/failures/7d03c0ce-4c65-4488-8448-6ae7475dd99b')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Failures and Enforcement')
    cy.get('#continue-button').click()
    cy.wait('@formSubmit')
    cy.url().should('include', '/compliance/7d03c0ce-4c65-4488-8448-6ae7475dd99b')
  })

  it('should return to check your report if came from check your report', () => {
    cy.intercept('POST', '/failures/**').as('formSubmit')
    cy.visit('/failures/89096e7c-c5cb-4ab0-b741-ae7fcd4d2ae1?returnTo=check-your-report')
    cy.url().should('include', '/failures')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Failures and Enforcement')
    cy.get('#continue-button').click()
    cy.wait('@formSubmit')
    cy.url().should('include', '/check-your-report/89096e7c-c5cb-4ab0-b741-ae7fcd4d2ae1')
  })
  it('correct validation should show on max character fields', () => {
    cy.visit('/failures/5800666c-d39e-4a04-8277-a82bf484f68d')
    cy.url().should('include', '/failures')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Failures and Enforcement')
    cy.get('#whyInBreach').clear()
    cy.get('#stepsToPreventBreach').clear()
    cy.get('#riskHistory').clear()
    cy.get('#supportingComments').clear()
    cy.get('#whyInBreach').invoke('val', 'X'.repeat(20001)).trigger('input')
    cy.get('#stepsToPreventBreach').invoke('val', 'X'.repeat(20001)).trigger('input')
    cy.get('#riskHistory').invoke('val', 'X'.repeat(20001)).trigger('input')
    cy.get('#supportingComments').invoke('val', 'X'.repeat(20001)).trigger('input')
    cy.get('#continue-button').click()
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Failures and Enforcement')
    cy.get('.govuk-error-summary__title').should('exist').should('contain.text', 'There is a problem')
    cy.get('#whyInBreach-error')
      .should('exist')
      .should('contain.text', 'Why is this person in breach: This field must be 20000 characters or less')
    cy.get('#stepsToPreventBreach-error')
      .should('exist')
      .should(
        'contain.text',
        'What steps have been taken to prevent this breach: This field must be 20000 characters or less',
      )
    cy.get('#riskHistory-error')
      .should('exist')
      .should(
        'contain.text',
        'Has the Risk of Serious Harm changed since the order was imposed: This field must be 20000 characters or less',
      )
    cy.get('#supportingComments-error')
      .should('exist')
      .should('contain.text', 'Comments to support the Recommendation : This field must be 20000 characters or less')
  })

  it('correct validation should show when Confirmation Statement unchecked', () => {
    cy.visit('/failures/f90dc7e9-1792-471a-af57-f6425abd58ec')
    cy.url().should('include', '/failures')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Failures and Enforcement')
    cy.get('input[id="confirmationStatement"]').uncheck()
    cy.get('#continue-button').click()
    cy.get('.govuk-error-summary__title').should('exist').should('contain.text', 'There is a problem')
    cy.get('#confirmationStatement-error')
      .should('exist')
      .should(
        'contain.text',
        'Confirmation Statement : Please complete the Diversity and equalities confirmation to proceed',
      )
  })

  it('should display contacts returned from DB as selected', () => {
    cy.visit('/failures/9adf969d-7632-4703-a039-965b9ecf6db6')
    cy.url().should('include', '/failures')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Failures and Enforcement')
    cy.get('#contact-7').should('be.checked')
    cy.get('#contact-0').should('not.be.checked')
    cy.get('#contact-1246574').should('not.be.checked')
  })

  it('should display contacts returned from DB but not integrations', () => {
    cy.visit('/failures/fcba94f3-af98-45b4-9df4-eab8c2ad2c46')
    cy.url().should('include', '/failures')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Failures and Enforcement')
    cy.get('#contact-7').should('not.be.checked')
    cy.get('#contact-0').should('not.be.checked')
    cy.get('#contact-1246574').should('not.be.checked')
    cy.get('#contact-42').should('be.checked')
    cy.get('label[for="contact-42"]').should('contain.text', 'Missing Contact Description')
  })

  it('should process save function correctly when adding/selecting contact', () => {
    cy.intercept('POST', '/failures/**').as('formSubmit')
    cy.visit('/failures/677f38d6-28be-488f-948c-e5757bd688e3')
    cy.url().should('include', '/failures')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Failures and Enforcement')
    cy.get('#contact-0').check()
    cy.get('#continue-button').click()
    cy.wait('@formSubmit')
    cy.url().should('include', '/compliance/677f38d6-28be-488f-948c-e5757bd688e3')
  })

  it('should process save function correctly when removing/deselecting contact', () => {
    cy.intercept('POST', '/failures/**').as('formSubmit')
    cy.visit('/failures/f34327bb-5e85-45e3-956b-e855fcb4ca59')
    cy.url().should('include', '/failures')
    cy.url().should('include', '/failures')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Failures and Enforcement')
    cy.get('#contact-42').uncheck()
    cy.get('#contact-7').uncheck()
    cy.get('#continue-button').click()
    cy.wait('@formSubmit')
    cy.url().should('include', '/compliance/f34327bb-5e85-45e3-956b-e855fcb4ca59')
  })

  it('should stay on page and show NDelius error message if 500 thrown from NDelius integration service', () => {
    cy.visit('/failures/5fad0c74-e7ee-4025-a8eb-4452e206a040')
    cy.get('.govuk-error-summary__title').should('exist').should('contain.text', 'There is a problem')
    cy.contains('There has been a problem fetching information from NDelius. Please try again later.').should('exist')
  })

  it('should stay on page and show COSSO Service error message if 500 thrown from COSSO Service', () => {
    cy.visit('/failures/17dcfbd8-7be9-4470-8748-1dd1e61ea665')
    cy.get('.govuk-error-summary__title').should('exist').should('contain.text', 'There is a problem')
    cy.contains(
      'There has been a problem fetching information from the Breach Report CO SSO Service. Please try again later.',
    ).should('exist')
  })
})

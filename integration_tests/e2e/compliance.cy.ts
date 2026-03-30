context('Compliance page', () => {
  it('can see fields with stored data', () => {
    cy.visit('/compliance/4c9a1ad2-7141-4b03-837f-b66346a0b6ad')
    cy.url().should('include', '/compliance')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Compliance to date')
    cy.get('#complianceToDate-hint .govuk-details__summary-text').should(
      'contain.text',
      'What information to include here',
    )
    cy.get('#complianceToDate-hint .govuk-details__text').should('contain.text', 'By assessing both compliance')
    cy.get('#compliance-to-date-information').should(
      'contain.text',
      'Describe the Compliance with the whole order to date?',
    )
    cy.get('#complianceToDate').should('contain.text', 'test 444')
    cy.get('label[for="requirement_1"]').should('contain.text', 'Requirement Zero')
    cy.get('#notes_1-hint').should('contain.text', 'Please add relevant detail')
    cy.get('label[for="requirement_2"]').should('contain.text', 'string')
  })

  it('can see buttons', () => {
    cy.visit('/compliance/4c9a1ad2-7141-4b03-837f-b66346a0b6ad')
    cy.url().should('include', '/compliance')
    cy.get('#continue-button').should('contain.text', 'Continue')
    cy.get('#close-button').should('contain.text', 'Save Progress and Close')
  })

  it('close button displays message', () => {
    cy.intercept('POST', '/compliance/**').as('saveAndCloseRequest')
    cy.visit('/compliance/4c9a1ad2-7141-4b03-837f-b66346a0b6ad')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Compliance to date')
    cy.get('#close-button').click()
    cy.wait('@saveAndCloseRequest').then(({ request }) => {
      const body = new URLSearchParams(request.body)
      expect(body.get('action')).to.equal('saveProgressAndClose')
    })
    cy.contains('You can now safely close this window').should('be.visible')
    cy.get('#page-title').should('not.exist')
  })

  it('continue button redirects to compliance page', () => {
    cy.intercept('POST', '/compliance/**').as('formSubmit')
    cy.visit('/compliance/4c9a1ad2-7141-4b03-837f-b66346a0b6ad')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Compliance to date')
    cy.get('#continue-button').click()
    cy.wait('@formSubmit')
    cy.url().should('include', '/check-your-report/4c9a1ad2-7141-4b03-837f-b66346a0b6ad')
  })

  it('correct validation should show on max character fields', () => {
    cy.visit('/compliance/4c9a1ad2-7141-4b03-837f-b66346a0b6ad')
    cy.url().should('include', '/compliance')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Compliance to date')
    cy.get('#complianceToDate').clear()
    cy.get('#complianceToDate').invoke('val', 'X'.repeat(20001)).trigger('input')
    cy.get('#notes_1').clear()
    cy.get('#notes_1').invoke('val', 'X'.repeat(20001)).trigger('input')
    cy.get('#continue-button').click()
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Compliance to date')
    cy.get('.govuk-error-summary__title').should('exist').should('contain.text', 'There is a problem')
    cy.get('.govuk-error-summary__list')
      .should('exist')
      .should('contain.text', 'Please ensure requirement notes are less than 20000 characters')
    cy.get('#complianceToDate-error')
      .should('exist')
      .should('contain.text', 'This field must be 20000 characters or less')
  })

  it('should display contacts returned from DB as selected', () => {
    cy.visit('/compliance/4c9a1ad2-7141-4b03-837f-b66346a0b6ad')
    cy.url().should('include', '/compliance')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Compliance to date')
    cy.get('#requirement_1').should('be.checked')
    cy.get('#requirement_2').should('be.checked')
    cy.get('#requirement_3').should('not.be.checked')
  })

  it('should process save function correctly when adding/selecting contact', () => {
    cy.intercept('POST', '/compliance/**').as('formSubmit')
    cy.visit('/compliance/4c9a1ad2-7141-4b03-837f-b66346a0b6ad')
    cy.url().should('include', '/compliance')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Compliance to date')
    cy.get('#requirement_3').check()
    cy.get('#continue-button').click()
    cy.wait('@formSubmit')
    cy.url().should('include', '/check-your-report/4c9a1ad2-7141-4b03-837f-b66346a0b6ad')
  })

  it('should process save function correctly when removing/deselecting contact', () => {
    cy.intercept('POST', '/compliance/**').as('formSubmit')
    cy.visit('/compliance/4c9a1ad2-7141-4b03-837f-b66346a0b6ad')
    cy.url().should('include', '/compliance')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Compliance to date')
    cy.get('#requirement_1').uncheck()
    cy.get('#continue-button').click()
    cy.wait('@formSubmit')
    cy.url().should('include', '/check-your-report/4c9a1ad2-7141-4b03-837f-b66346a0b6ad')
  })
})

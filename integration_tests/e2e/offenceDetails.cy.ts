context('Offence Details page', () => {
  it('can see readonly fields', () => {
    cy.visit('/offence-details/f92b344c-5a20-405c-b407-3bac4a507043')
    cy.url().should('include', '/offence-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Offence Details')
    cy.get('#main-offence').should('contain.text', 'Offence Description')
    cy.get('#additional-offence-1').should('contain.text', 'Additional Offence Description A')
    cy.get('#additional-offence-2').should('contain.text', 'Additional Offence Description B')
    cy.get('#court').should('contain.text', 'TEST style Court')
    cy.get('#sentence-date').should('contain.text', '2025-04-01')
    cy.get('#sentence-imposed').should('contain.text', 'Sentence Imposed Description')
    cy.get('#custody-length').should('contain.text', '20 Days')
    cy.get('#requirements-imposed-1').should(
      'contain.text',
      'Requirement Type: Requirement Type Main Category Description',
    )
    cy.get('#requirements-imposed-1').should('contain.text', 'Requirement Length: 20 Months')
    cy.get('#requirements-imposed-1').should('contain.text', 'Secondary Requirement Length: 12 Months')
    cy.get('#requirements-imposed-2').should('contain.text', 'Requirement Type: Another Main Category Description')
    cy.get('#requirements-imposed-2').should('contain.text', 'Requirement Length: 7 Years')
    cy.get('#requirements-imposed-2').should('contain.text', 'Secondary Requirement Length: 10 Months')
    cy.get('#additional-sentence-1').should('contain.text', 'Main Type - Sub Type')
    cy.get('#additional-sentence-2').should('contain.text', 'Another Main Type - Second Sub Type')
    cy.get('#amendment-1').should('contain.text', 'Details of the Amendment: TEST DETAILS')
    cy.get('#amendment-1').should('contain.text', 'Reasons for the Amendment: TEST REASON')
    cy.get('#amendment-1').should('contain.text', 'Date of the Amendment: 2026-01-14')
    cy.get('#amendment-2').should('contain.text', 'Details of the Amendment: SECOND DETAILS')
    cy.get('#amendment-2').should('contain.text', 'Reasons for the Amendment: SECOND REASON')
    cy.get('#amendment-2').should('contain.text', 'Date of the Amendment: 2025-12-25')
  })

  it('can see buttons', () => {
    cy.visit('/offence-details/f92b344c-5a20-405c-b407-3bac4a507043')
    cy.url().should('include', '/offence-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Offence Details')
    cy.get('#continue-button').should('contain.text', 'Continue')
    cy.get('#close-button').should('contain.text', 'Save Progress and Close')
  })

  it('can see add amendment button conditionally', () => {
    cy.visit('/offence-details/f92b344c-5a20-405c-b407-3bac4a507043')
    cy.url().should('include', '/offence-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Offence Details')
    cy.get('#add-amendment-button').should('not.be.visible')
    cy.get('input[name="amendmentsToAdd"][value="Yes"]').check({ force: true })
    cy.get('#add-amendment-button').should('be.visible').should('contain.text', 'Add Amendment')
    cy.get('input[name="amendmentsToAdd"][value="No"]').check({ force: true })
    cy.get('#add-amendment-button').should('not.be.visible')
  })

  it('close button displays message', () => {
    cy.intercept('POST', '/offence-details/**').as('saveAndCloseRequest')
    cy.visit('/offence-details/f13cd4b7-52fd-4d9e-8ce1-b380fc0c8be4')
    cy.get('#close-button').click()
    cy.wait('@saveAndCloseRequest').then(({ request }) => {
      const body = new URLSearchParams(request.body)
      expect(body.get('action')).to.equal('saveProgressAndClose')
    })
    cy.contains('You can now safely close this window').should('be.visible')
    cy.get('#page-title').should('not.exist')
  })

  it('continue button redirects to failures & enforcements page', () => {
    cy.intercept('POST', '/offence-details/**').as('formSubmit')
    cy.visit('/offence-details/5ef68fe7-f7c5-4a3b-a30f-3d386c08138b')
    cy.get('#continue-button').click()
    cy.wait('@formSubmit')
    cy.url().should('include', '/failures/5ef68fe7-f7c5-4a3b-a30f-3d386c08138b')
  })

  it('add amendment button redirects to add amendment page', () => {
    cy.visit('/offence-details/1397b54d-4360-4ec5-bc75-8a908bc5e49c')
    cy.url().should('include', '/offence-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Offence Details')
    cy.get('input[name="amendmentsToAdd"][value="Yes"]').check({ force: true })
    cy.get('#add-amendment-button').click()
    cy.url().should('include', '/add-amendment/1397b54d-4360-4ec5-bc75-8a908bc5e49c')
  })

  it('edit amendment link redirects to edit amendment page with correct url', () => {
    cy.visit('/offence-details/499ab129-866a-4f9e-a4bf-7699cc95a4f7')
    cy.url().should('include', '/offence-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Offence Details')
    cy.get('#edit-link-1').should('exist').should('contain.text', 'Edit this Amendment')
    cy.get('#edit-link-1').click()
    cy.url().should(
      'include',
      '/add-amendment/499ab129-866a-4f9e-a4bf-7699cc95a4f7?amendmentId=00000000-0000-0000-0000-000000000003',
    )
  })

  it('delete amendment link redirects to delete amendment page with correct url', () => {
    cy.visit('/offence-details/deb3be2a-e196-412e-b349-7c89d1b539af')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Offence Details')
    cy.get('#delete-link-1').should('exist').should('contain.text', 'Delete this Amendment')
    cy.get('#delete-link-1').click()
    cy.url().should(
      'include',
      '/delete-amendment/deb3be2a-e196-412e-b349-7c89d1b539af?amendmentId=00000000-0000-0000-0000-000000000004',
    )
  })

  it('should stay on page and show NDelius error message if 500 thrown from NDelius integration service', () => {
    cy.visit('/offence-details/9de01b5e-30bd-4989-b0ad-29d5df2b70cf')
    cy.get('.govuk-error-summary__title').should('exist').should('contain.text', 'There is a problem')
    cy.contains('There has been a problem fetching information from NDelius. Please try again later.').should('exist')
  })

  it('should stay on page and show COSSO Service error message if 500 thrown from COSSO Service', () => {
    cy.visit('/offence-details/d6cbd844-28e9-4fcb-82db-f50bd335b7f9')
    cy.get('.govuk-error-summary__title').should('exist').should('contain.text', 'There is a problem')
    cy.contains(
      'There has been a problem fetching information from the Breach Report CO SSO Service. Please try again later.',
    ).should('exist')
  })
})

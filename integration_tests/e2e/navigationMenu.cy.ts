context('Side Navigation Menu checks', () => {
  const unsavedCossoId = '00000000-0000-0000-0000-000000000001'
  const savedCossoId = '9de01b5e-30bd-4989-b0ad-29d5df2b70cs'

  it('All navigation items exist', () => {
    cy.visit(`/basic-details/${unsavedCossoId}`)
    cy.get('#nav-basic-details').should('exist')
    cy.get('#nav-witness-details-disabled').should('exist')
    cy.get('#nav-offence-details-disabled').should('exist')
    cy.get('#nav-failures-disabled').should('exist')
    cy.get('#nav-compliance-disabled').should('exist')
    cy.get('#nav-sign-and-send-disabled').should('exist')
    cy.get('#nav-check-your-answers-disabled').should('exist')
  })

  it('Disabled navigation links have href="#" and disabled-nav class', () => {
    cy.visit(`/basic-details/${unsavedCossoId}`)
    cy.get('#nav-witness-details-disabled').should('have.attr', 'href', '#').and('have.class', 'disabled-nav')
    cy.get('#nav-offence-details-disabled').should('have.attr', 'href', '#').and('have.class', 'disabled-nav')
    cy.get('#nav-failures-disabled').should('have.attr', 'href', '#').and('have.class', 'disabled-nav')
    cy.get('#nav-compliance-disabled').should('have.attr', 'href', '#').and('have.class', 'disabled-nav')
    cy.get('#nav-sign-and-send-disabled').should('have.attr', 'href', '#').and('have.class', 'disabled-nav')
    cy.get('#nav-check-your-answers-disabled').should('have.attr', 'href', '#').and('have.class', 'disabled-nav')
  })

  it('Navigates to Basic Details', () => {
    cy.visit(`/basic-details/${unsavedCossoId}`)
    cy.get('#nav-basic-details').click()
    cy.url().should('include', `/basic-details/${unsavedCossoId}`)
  })

  it('Navigates to RO and Witness Details when basic details saved', () => {
    cy.visit(`/basic-details/${savedCossoId}`)
    cy.get('#nav-witness-details').click()
    cy.url().should('include', `/witness-details/${savedCossoId}`)
  })

  it('Navigates to Offence Details when witness details saved', () => {
    cy.visit(`/basic-details/${savedCossoId}`)
    cy.get('#nav-offence-details').click()
    cy.url().should('include', `/offence-details/${savedCossoId}`)
  })

  it('Navigates to Failures and Enforcements when offence details saved', () => {
    cy.visit(`/basic-details/${savedCossoId}`)
    cy.get('#nav-failures').click()
    cy.url().should('include', `/failures/${savedCossoId}`)
  })

  it('Navigates to Compliance to date when failures saved', () => {
    cy.visit(`/basic-details/${savedCossoId}`)
    cy.get('#nav-compliance').click()
    cy.url().should('include', `/compliance/${savedCossoId}`)
  })

  it('Navigates to Sign and Send when compliance saved', () => {
    cy.visit(`/basic-details/${savedCossoId}`)
    cy.get('#nav-sign-and-send').click()
    cy.url().should('include', `/sign-and-send/${savedCossoId}`)
  })

  it('Check Your Answers is disabled when sign-and-send not yet saved', () => {
    cy.visit(`/basic-details/${savedCossoId}`)
    cy.get('#nav-check-your-answers-disabled')
      .should('exist')
      .and('have.attr', 'href', '#')
      .and('have.class', 'disabled-nav')
  })
})

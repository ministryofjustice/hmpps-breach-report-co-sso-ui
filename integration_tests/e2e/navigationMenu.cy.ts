context('Side Navigation Menu checks', () => {
  const cossoId = '00000000-0000-0000-0000-000000000001'

  it('All navigation items exist', () => {
    cy.visit(`/basic-details/${cossoId}`)
    cy.get('#nav-basic-details').should('exist')
    cy.get('#nav-witness-details').should('exist')
    cy.get('#nav-offence-details').should('exist')
    cy.get('#nav-failures').should('exist')
    cy.get('#nav-compliance').should('exist')
    cy.get('#nav-check-your-report').should('exist')
  })

  it('Navigates to Basic Details', () => {
    cy.visit(`/basic-details/${cossoId}`)
    cy.get('#nav-basic-details').click()
    cy.url().should('include', `/basic-details/${cossoId}`)
  })

  it('Navigates to RO and Witness Details', () => {
    cy.visit(`/basic-details/${cossoId}`)
    cy.get('#nav-witness-details').click()
    cy.url().should('include', `/witness-details/${cossoId}`)
  })

  it('Navigates to Offence Details', () => {
    cy.visit(`/basic-details/${cossoId}`)
    cy.get('#nav-offence-details').click()
    cy.url().should('include', `/offence-details/${cossoId}`)
  })

  it('Navigates to Failures and Enforcements', () => {
    cy.visit(`/basic-details/${cossoId}`)
    cy.get('#nav-failures').click()
    cy.url().should('include', `/failures/${cossoId}`)
  })

  it('Navigates to Compliance to date', () => {
    cy.visit(`/basic-details/${cossoId}`)
    cy.get('#nav-compliance').click()
    cy.url().should('include', `/compliance/${cossoId}`)
  })

  it('Navigates to Check Your Report', () => {
    cy.visit(`/basic-details/${cossoId}`)
    cy.get('#nav-check-your-report').click()
    cy.url().should('include', `/check-your-report/${cossoId}`)
  })
})

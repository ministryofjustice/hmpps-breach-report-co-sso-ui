context('Confirm delete Page', () => {
  const cossoId = '9de01b5e-30bd-4989-b0ad-29d5df2b70cs'

  it('renders the delete confirmation screen correctly', () => {
    cy.visit(`/confirm-delete/${cossoId}`)
    cy.contains('Are you sure you wish to delete this document?').should('exist')
    cy.get('#confirm-button').should('exist').and('contain.text', 'Confirm')
    cy.get('#cancel-button').should('exist').and('contain.text', 'Cancel')
  })

  it('cancel button redirects back to check your report page without performing a delete', () => {
    cy.visit(`/confirm-delete/${cossoId}`)
    cy.get('#cancel-button').click()
    cy.url().should('include', `/check-your-report/${cossoId}`)
  })

  it('confirm button redirects to Document Deleted confirmation screen', () => {
    cy.visit(`/confirm-delete/${cossoId}`)
    cy.get('#confirm-button').click()
    cy.url().should('include', `/form-deleted/${cossoId}`)
  })
})

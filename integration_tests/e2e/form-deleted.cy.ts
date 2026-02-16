context('Form deleted Page', () => {
  const suicideRiskId = '9de01b5e-30bd-4989-b0ad-29d5df2b70cs'

  it('renders the form deleted screen correctly', () => {
    cy.visit(`/form-deleted/${suicideRiskId}`)
    cy.contains('Document Deleted').should('exist')
    cy.contains('This form has been permanently deleted and cannot be recovered').should('exist')
  })
})

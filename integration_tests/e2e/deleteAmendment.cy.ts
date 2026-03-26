context('Delete Amendment Page', () => {
  const cossoId = 'f92b344c-5a20-405c-b407-3bac4a507043'
  const amendmentId = '1397b54d-4360-4ec5-bc75-8a908bc5e49c'

  it('renders the delete confirmation screen correctly', () => {
    cy.visit(`/delete-amendment/${cossoId}/${amendmentId}`)
    cy.contains('Are you sure you wish to delete this Amendment?').should('exist')
    cy.get('#confirm-button').should('exist').and('contain.text', 'Confirm')
    cy.get('#cancel-button').should('exist').and('contain.text', 'Cancel')
  })

  it('cancel button redirects back to offence-details screen', () => {
    cy.visit(`/delete-amendment/${cossoId}/${amendmentId}`)
    cy.get('#cancel-button').click()
    cy.url().should('include', `/offence-details/${cossoId}`)
  })

  it('confirm button redirects back to offence-details screen', () => {
    cy.visit(`/delete-amendment/${cossoId}/${amendmentId}`)
    cy.get('#confirm-button').click()
    cy.url().should('include', `/offence-details/${cossoId}`)
  })
})

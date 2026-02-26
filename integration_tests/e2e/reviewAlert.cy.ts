context('Review Alert data checks', () => {
  it('Basic Details no review', () => {
    cy.visit('/basic-details/9de01b5e-30bd-4989-b0ad-29d5df2b70cs')
    cy.get('#reviewAlert').should('not.exist')
  })

  it('Basic Details no review', () => {
    cy.visit('/basic-details/9de01b5e-30bd-4989-b0ad-29d5df2b70cs')
    cy.get('#reviewAlert').should('not.exist')
  })

  it('RO and Witness Details no review', () => {
    cy.visit('/witness-details/9de01b5e-30bd-4989-b0ad-29d5df2b70cs')
    cy.get('#reviewAlert').should('not.exist')
  })

  it('Offence Details no review', () => {
    cy.visit('/offence-details/9de01b5e-30bd-4989-b0ad-29d5df2b70cs')
    cy.get('#reviewAlert').should('not.exist')
  })

  it('Failures and Enforcement no review', () => {
    cy.visit('/failures/9de01b5e-30bd-4989-b0ad-29d5df2b70cs')
    cy.get('#reviewAlert').should('not.exist')
  })

  it('Compliance no review', () => {
    cy.visit('/compliance/9de01b5e-30bd-4989-b0ad-29d5df2b70cs')
    cy.get('#reviewAlert').should('not.exist')
  })

  it('Check Your Answers no review', () => {
    cy.visit('/check-your-report/9de01b5e-30bd-4989-b0ad-29d5df2b70cs')
    cy.get('#reviewAlert').should('not.exist')
  })

  it('Basic Details merge review', () => {
    cy.visit('/check-your-report/6c9e90ed-1ac1-4bcb-b271-6b0a1f6ef9a4')
    cy.get('#reviewAlert').should('exist')
    cy.get('#reviewAlert').should(
      'contain.text',
      'A Merge occurred on 1/1/2025 in NDelius and important details have changed. This form should be reviewed before proceeding. Please confirm all information or discard this form.',
    )
  })

  it('RO and Witness Details merge review', () => {
    cy.visit('/check-your-report/6c9e90ed-1ac1-4bcb-b271-6b0a1f6ef9a4')
    cy.get('#reviewAlert').should('exist')
    cy.get('#reviewAlert').should(
      'contain.text',
      'A Merge occurred on 1/1/2025 in NDelius and important details have changed. This form should be reviewed before proceeding. Please confirm all information or discard this form.',
    )
  })

  it('Offence Details merge review', () => {
    cy.visit('/check-your-report/6c9e90ed-1ac1-4bcb-b271-6b0a1f6ef9a4')
    cy.get('#reviewAlert').should('exist')
    cy.get('#reviewAlert').should(
      'contain.text',
      'A Merge occurred on 1/1/2025 in NDelius and important details have changed. This form should be reviewed before proceeding. Please confirm all information or discard this form.',
    )
  })

  it('Failures and Enforcement merge review', () => {
    cy.visit('/check-your-report/6c9e90ed-1ac1-4bcb-b271-6b0a1f6ef9a4')
    cy.get('#reviewAlert').should('exist')
    cy.get('#reviewAlert').should(
      'contain.text',
      'A Merge occurred on 1/1/2025 in NDelius and important details have changed. This form should be reviewed before proceeding. Please confirm all information or discard this form.',
    )
  })

  it('Compliance merge review', () => {
    cy.visit('/check-your-report/6c9e90ed-1ac1-4bcb-b271-6b0a1f6ef9a4')
    cy.get('#reviewAlert').should('exist')
    cy.get('#reviewAlert').should(
      'contain.text',
      'A Merge occurred on 1/1/2025 in NDelius and important details have changed. This form should be reviewed before proceeding. Please confirm all information or discard this form.',
    )
  })

  it('Check Your Answers merge review', () => {
    cy.visit('/check-your-report/6c9e90ed-1ac1-4bcb-b271-6b0a1f6ef9a4')
    cy.get('#reviewAlert').should('exist')
    cy.get('#reviewAlert').should(
      'contain.text',
      'A Merge occurred on 1/1/2025 in NDelius and important details have changed. This form should be reviewed before proceeding. Please confirm all information or discard this form.',
    )
  })

  it('Basic Details unmerge review', () => {
    cy.visit('/check-your-report/a3b2e7c4-8b0d-4f6f-9e12-2c6d1a7f3c58')
    cy.get('#reviewAlert').should('exist')
    cy.get('#reviewAlert').should(
      'contain.text',
      'An Unmerge occurred on 1/1/2025 in NDelius and important details have changed. This form should be reviewed before proceeding. Please confirm all information or discard this form.',
    )
  })

  it('RO and Witness Details unmerge review', () => {
    cy.visit('/check-your-report/a3b2e7c4-8b0d-4f6f-9e12-2c6d1a7f3c58')
    cy.get('#reviewAlert').should('exist')
    cy.get('#reviewAlert').should(
      'contain.text',
      'An Unmerge occurred on 1/1/2025 in NDelius and important details have changed. This form should be reviewed before proceeding. Please confirm all information or discard this form.',
    )
  })

  it('Offence Details unmerge review', () => {
    cy.visit('/check-your-report/a3b2e7c4-8b0d-4f6f-9e12-2c6d1a7f3c58')
    cy.get('#reviewAlert').should('exist')
    cy.get('#reviewAlert').should(
      'contain.text',
      'An Unmerge occurred on 1/1/2025 in NDelius and important details have changed. This form should be reviewed before proceeding. Please confirm all information or discard this form.',
    )
  })

  it('Failures and Enforcement unmerge review', () => {
    cy.visit('/check-your-report/a3b2e7c4-8b0d-4f6f-9e12-2c6d1a7f3c58')
    cy.get('#reviewAlert').should('exist')
    cy.get('#reviewAlert').should(
      'contain.text',
      'An Unmerge occurred on 1/1/2025 in NDelius and important details have changed. This form should be reviewed before proceeding. Please confirm all information or discard this form.',
    )
  })

  it('Compliance unmerge review', () => {
    cy.visit('/check-your-report/a3b2e7c4-8b0d-4f6f-9e12-2c6d1a7f3c58')
    cy.get('#reviewAlert').should('exist')
    cy.get('#reviewAlert').should(
      'contain.text',
      'An Unmerge occurred on 1/1/2025 in NDelius and important details have changed. This form should be reviewed before proceeding. Please confirm all information or discard this form.',
    )
  })

  it('Check Your Answers unmerge review', () => {
    cy.visit('/check-your-report/a3b2e7c4-8b0d-4f6f-9e12-2c6d1a7f3c58')
    cy.get('#reviewAlert').should('exist')
    cy.get('#reviewAlert').should(
      'contain.text',
      'An Unmerge occurred on 1/1/2025 in NDelius and important details have changed. This form should be reviewed before proceeding. Please confirm all information or discard this form.',
    )
  })

  it('Basic Details event move review', () => {
    cy.visit('/check-your-report/f1d6c2a9-3f44-4c2a-9a9d-9c4a6bb7c1e0')
    cy.get('#reviewAlert').should('exist')
    cy.get('#reviewAlert').should(
      'contain.text',
      'A Move Event occurred on 1/1/2025 in NDelius and important details have changed. This form should be reviewed before proceeding. Please confirm all information or discard this form.',
    )
  })

  it('RO and Witness Details event move review', () => {
    cy.visit('/check-your-report/f1d6c2a9-3f44-4c2a-9a9d-9c4a6bb7c1e0')
    cy.get('#reviewAlert').should('exist')
    cy.get('#reviewAlert').should(
      'contain.text',
      'A Move Event occurred on 1/1/2025 in NDelius and important details have changed. This form should be reviewed before proceeding. Please confirm all information or discard this form.',
    )
  })

  it('Offence Details event move review', () => {
    cy.visit('/check-your-report/f1d6c2a9-3f44-4c2a-9a9d-9c4a6bb7c1e0')
    cy.get('#reviewAlert').should('exist')
    cy.get('#reviewAlert').should(
      'contain.text',
      'A Move Event occurred on 1/1/2025 in NDelius and important details have changed. This form should be reviewed before proceeding. Please confirm all information or discard this form.',
    )
  })

  it('Failures and Enforcement event move review', () => {
    cy.visit('/check-your-report/f1d6c2a9-3f44-4c2a-9a9d-9c4a6bb7c1e0')
    cy.get('#reviewAlert').should('exist')
    cy.get('#reviewAlert').should(
      'contain.text',
      'A Move Event occurred on 1/1/2025 in NDelius and important details have changed. This form should be reviewed before proceeding. Please confirm all information or discard this form.',
    )
  })

  it('Compliance event move review', () => {
    cy.visit('/check-your-report/f1d6c2a9-3f44-4c2a-9a9d-9c4a6bb7c1e0')
    cy.get('#reviewAlert').should('exist')
    cy.get('#reviewAlert').should(
      'contain.text',
      'A Move Event occurred on 1/1/2025 in NDelius and important details have changed. This form should be reviewed before proceeding. Please confirm all information or discard this form.',
    )
  })

  it('Check Your Answers event move review', () => {
    cy.visit('/check-your-report/f1d6c2a9-3f44-4c2a-9a9d-9c4a6bb7c1e0')
    cy.get('#reviewAlert').should('exist')
    cy.get('#reviewAlert').should(
      'contain.text',
      'A Move Event occurred on 1/1/2025 in NDelius and important details have changed. This form should be reviewed before proceeding. Please confirm all information or discard this form.',
    )
  })
})

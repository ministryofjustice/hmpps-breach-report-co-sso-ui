import fs from 'fs'
import path from 'path'

describe('check-your-answers diversity confirmation row', () => {
  it('uses confirmEqualities to decide whether the Required tag is shown', () => {
    const templatePath = path.resolve(__dirname, 'check-your-answers.njk')
    const template = fs.readFileSync(templatePath, 'utf8')
    const diversitySection =
      template.match(
        /<dt class="govuk-summary-list__key">\s*Diversity confirmation\s*<\/dt>[\s\S]*?<\/dd>\s*<\/div>/,
      )?.[0] ?? ''

    expect(diversitySection).toContain('{% if not cosso.confirmEqualities %}')
    expect(diversitySection).not.toContain('cosso.recommendations')
  })
})

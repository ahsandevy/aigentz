import { fireEvent, render, screen, within } from '@testing-library/react'
import { expect, it } from 'vitest'
import ExplorerPage from './ExplorerPage'

it('shows the reference visuals above the campaign table and filters rows', () => {
  render(<ExplorerPage />)
  const visuals = screen.getByRole('heading', { name: 'Performance Visuals' })
  const table = screen.getByRole('table')

  expect(visuals.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(screen.getAllByRole('article')).toHaveLength(6)
  expect(within(table).getAllByRole('row')).toHaveLength(6)

  fireEvent.change(screen.getByRole('searchbox', { name: 'Search campaigns' }), { target: { value: 'VIP' } })
  expect(within(table).getAllByRole('row')).toHaveLength(2)
  expect(within(table).getByText('VIP Loyalty Re-engagement')).toBeTruthy()
})

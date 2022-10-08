import { render, screen } from '@testing-library/react'
import App from './App'

test('renders Data Brwsr text', () => {
  render(<App />)
  const linkElement = screen.getByText(/SeqBrwsr/i)
  expect(linkElement).toBeInTheDocument()
})

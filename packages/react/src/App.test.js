import { render, screen } from '@testing-library/react'
import App from './App'

test('renders Data Brwsr texqt', () => {
  render(<App />)
  const linkElement = screen.getByText(/Data Brwsr/i)
  expect(linkElement).toBeInTheDocument()
})

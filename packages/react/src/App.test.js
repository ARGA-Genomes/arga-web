import { render, screen } from '@testing-library/react'
import App from './App'

test('renders ncbi refseq text', () => {
  render(<App />)
  const linkElement = screen.getByText(/ncbi refseq/i)
  expect(linkElement).toBeInTheDocument()
})

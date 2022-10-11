import { act, render } from '@testing-library/react'
import App from '../App'

const waitForComponentToPaint = async (wrapper) => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve))
    wrapper.update()
  })
}

test('renders Data Brwsr text', () => {
  const wrapper = render(<App />)
  waitForComponentToPaint(wrapper)
  const headerElement = wrapper.getByText(/SeqBrwsr/i)
  expect(headerElement).toBeInTheDocument()
})

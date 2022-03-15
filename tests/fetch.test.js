import {useFetch} from '../src/client'
describe('my fetch', () => {
  it('fetches', () => {
    let x
    useFetch('todo', 'https://jsonplaceholder.typicode.com/todos').subscribe(value => x = value)

    expect(x.status)
  })
})
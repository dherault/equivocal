import { describe, expect, test } from '@jest/globals'

import { foo } from './index'

describe('test', () => {
  test('test', () => {
    expect(foo()).toBe(true)
  })
})

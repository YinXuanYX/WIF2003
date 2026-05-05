export const simulateDelay = (data, ms) =>
  new Promise((resolve) =>
    setTimeout(() => resolve(data), ms ?? 800 + Math.random() * 700)
  )

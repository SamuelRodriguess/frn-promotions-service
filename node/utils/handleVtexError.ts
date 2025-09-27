import type { TError } from '../typings/errors'

/**
 * Safely handles errors in VTEX IO middlewares or resolvers by
 * sanitizing the output sent to the client.
 *
 * Instead of exposing raw AxiosError or stack traces (which contain
 * sensitive internal information such as headers, request URLs, and
 * infrastructure details), this util ensures that the client only
 * receives a clean `{ message }` JSON response with the appropriate
 * HTTP status code.
 *
 * @function handleVtexError
 * @param {Context} ctx - VTEX IO context object used to set status and body.
 * @param {TError} error - The error object (can be AxiosError, VTEX API error, or a generic error).
 *
 * @example
 * try {
 *   const data = await ctx.clients.rnb.getAllBenefits()
 *   ctx.body = data
 * } catch (err) {
 *   handleVtexError(ctx, err)
 * }
 */
export function handleVtexError(ctx: Context, error: TError) {
  const status = error.response?.status ?? error.status ?? 500
  const message = error.message ?? 'Unexpected error'

  ctx.status = status
  ctx.body = { message, status }
}

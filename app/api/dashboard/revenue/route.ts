import { success, requireAuth, handleApiError } from "@/lib/api-helpers"

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export async function GET() {
  try {
    await requireAuth()
    const currentMonth = new Date().getMonth()
    const data = Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - 5 + i + 12) % 12
      return {
        month: months[monthIndex],
        revenue: Math.floor(Math.random() * 50000) + 20000,
        expenses: Math.floor(Math.random() * 30000) + 10000,
      }
    })
    return success(data)
  } catch (err) {
    return handleApiError(err)
  }
}

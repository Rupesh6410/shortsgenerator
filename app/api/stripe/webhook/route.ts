import { prisma } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-11-17.clover'
})

export async function POST(req: Request) {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature') as string
    const webHookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webHookSecret) {
        return new Response('Webhook secret not present or expired buddy', { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(body, signature, webHookSecret)

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const priceId = session.metadata?.priceId

        const creditMap: Record<string, number> = {
            'price_1SXzGjPXL7FpJPhppwooQegy': 1,
            'price_1SXzM2PXL7FpJPhppyElv3Se': 25,
            'price_1SXzHQPXL7FpJPhpYiQpgIZ6': 150
        }

        const creditsToAdd = creditMap[priceId || ''] || 0

        if (userId && creditsToAdd > 0) {
            await prisma.user.update({
                where: {
                    userId: userId
                },
                data: {
                    credits: {
                        increment: creditsToAdd
                    }
                }
            })
        }
    }

    return new Response('OK', { status: 200 })
}
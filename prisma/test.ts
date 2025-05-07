import { loggedUserSelect } from '../src/types/prisma-select'
import { PrismaClient } from '../src/generated/prisma/client'
const prisma = new PrismaClient()

async function main() {
const loggedUser = await prisma.user.findUnique({
        where: {
            email: 'admin@domain.com'
        },
        select: loggedUserSelect
    })
    console.log('Logged user', loggedUser)

}
main()
    .then(async () => {
        console.log('After seed success')
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
import { PrismaClient } from "@prisma/client"
import { log } from "console"

const prismaClient = new PrismaClient({
    log: ["query"]
})

export default prismaClient
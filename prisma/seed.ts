import { PrismaClient } from '@generated/client'
import { hashSync } from 'bcrypt'
import ms from 'ms'

import { adapter } from './prisma-adapter'

export const prisma = new PrismaClient({ adapter })

export async function up() {
	await prisma.user.createMany({
		data: [
			{
				id: '1',
				name: 'Nodirbek',
				lastName: 'Mullaboyev',
				userName: 'FisherMan',
				email: 'fishberg2020@mail.ru',
				password: hashSync('123456789N', 10),
				role: 'REGULAR'
			},
			{
				id: '2',
				name: 'Bekzod',
				lastName: 'Ravshanbekov',
				userName: 'Onlinee',
				email: 'bekzodrn@mail.ru',
				password: hashSync('Bekzod2001', 10),
				role: 'ADMIN'
			},
			{
				id: '3',
				name: 'Navruza',
				lastName: 'Xasanova',
				userName: 'Cooker',
				email: 'navruza@mail.ru',
				password: hashSync('123456789N', 10),
				role: 'REGULAR'
			}
		]
	})

	await prisma.group.create({
		data: {
			id: '1',
			name: 'Fishers',
			owner: {
				connect: {
					id: '1'
				}
			},
			isPublic: true
		}
	})
	await prisma.group.create({
		data: {
			id: '2',
			name: 'Cookers',
			owner: {
				connect: {
					id: '3'
				}
			},
			isPublic: true
		}
	})

	await prisma.groupMember.create({
		data: {
			id: '1',
			inGroup: {
				connect: { id: '1' }
			},
			type: 'OWNER',
			user: {
				connect: {
					id: '1'
				}
			}
		}
	})
	await prisma.groupMember.create({
		data: {
			id: '2',
			inGroup: {
				connect: {
					id: '1'
				}
			},
			type: 'MEMBER',
			user: {
				connect: {
					id: '2'
				}
			}
		}
	})
	await prisma.groupMember.create({
		data: {
			id: '3',
			inGroup: {
				connect: {
					id: '2'
				}
			},
			type: 'OWNER',
			user: {
				connect: {
					id: '3'
				}
			}
		}
	})
	await prisma.groupMember.create({
		data: {
			id: '4',
			inGroup: {
				connect: {
					id: '2'
				}
			},
			type: 'MEMBER',
			user: {
				connect: {
					id: '1'
				}
			}
		}
	})

	await prisma.group.update({
		where: {
			id: '1'
		},
		data: {
			members: {
				connect: [{ id: '1' }, { id: '2' }]
			}
		}
	})
	await prisma.group.update({
		where: {
			id: '2'
		},
		data: {
			members: {
				connect: [{ id: '3' }, { id: '4' }]
			}
		}
	})

	await prisma.project.create({
		data: {
			id: '1',
			name: 'Fisher table',
			group: {
				connect: {
					id: '1'
				}
			},
			isPublic: true
		}
	})
	await prisma.project.create({
		data: {
			id: '2',
			name: 'Novisibirskiy CAKE',
			group: {
				connect: {
					id: '2'
				}
			},
			isPublic: true
		}
	})

	await prisma.task.create({
		data: {
			id: '1',
			text: 'Dolor dolor modi totam in aut nostrum. Assumenda fugit voluptas. Sunt et non sint aut neque odio eum. Nobis et autem ut aspernatur debitis aut molestias. Tenetur quod adipisci tenetur sed voluptas doloremque',
			creator: { connect: { id: '1' } },
			assignee: { connect: { id: '2' } },
			inProject: { connect: { id: '1' } },
			description: 'magnam et consequatur',
			priority: 'URGENT',
			title: 'Rerum a aut incidunt dignissimos aut culpa ratione temporibus aspernatur',
			status: 'TODO',
			expiresAt: new Date(Date.now() + ms('3d'))
		}
	})
	await prisma.task.create({
		data: {
			id: '2',
			text: 'Asperiores modi earum laborum consequatur ea. Delectus pariatur facilis aliquid. Deleniti similique aliquam rerum et aperiam expedita quo praesentium. Voluptas non impedit unde nisi sunt animi soluta. In fugiat et',
			creator: { connect: { id: '1' } },
			assignee: { connect: { id: '1' } },
			inProject: { connect: { id: '1' } },
			description: 'saepe repudiandae ducimus',
			priority: 'LOW',
			title: 'fugiat',
			status: 'TODO',
			expiresAt: new Date(Date.now() + ms('1d'))
		}
	})

	await prisma.task.create({
		data: {
			id: '3',
			text: 'Asperiores modi earum laborum consequatur ea. Delectus pariatur facilis aliquid. Deleniti similique aliquam rerum et aperiam expedita quo praesentium. Voluptas non impedit unde nisi sunt animi soluta. In fugiat et',
			creator: { connect: { id: '1' } },
			assignee: { connect: { id: '3' } },
			inProject: { connect: { id: '2' } },
			description: 'saepe repudiandae ducimus',
			priority: 'LOW',
			title: 'fugiat',
			status: 'TODO',
			expiresAt: new Date(Date.now() + ms('1d'))
		}
	})
}

export async function down() {
	await prisma.$executeRaw`TRUNCATE TABLE "avatars" RESTART IDENTITY CASCADE;`
	await prisma.$executeRaw`TRUNCATE TABLE "badges" RESTART IDENTITY CASCADE;`
	await prisma.$executeRaw`TRUNCATE TABLE "group_members" RESTART IDENTITY CASCADE;`
	await prisma.$executeRaw`TRUNCATE TABLE "groups" RESTART IDENTITY CASCADE;`
	await prisma.$executeRaw`TRUNCATE TABLE "images" RESTART IDENTITY CASCADE;`
	await prisma.$executeRaw`TRUNCATE TABLE "messages" RESTART IDENTITY CASCADE;`
	await prisma.$executeRaw`TRUNCATE TABLE "notifications" RESTART IDENTITY CASCADE;`
	await prisma.$executeRaw`TRUNCATE TABLE "projects" RESTART IDENTITY CASCADE;`
	await prisma.$executeRaw`TRUNCATE TABLE "skills" RESTART IDENTITY CASCADE;`
	await prisma.$executeRaw`TRUNCATE TABLE "tasks" RESTART IDENTITY CASCADE;`
	await prisma.$executeRaw`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;`
}

async function main() {
	try {
		await down()
		await up()

		console.log(`\n> Finish with: SUCCESS 🌱`)
	} catch (error) {
		console.log('\n> Error with: ' + error)
		process.exit(1)
	}
}

main().finally(async () => {
	await prisma.$disconnect()
})

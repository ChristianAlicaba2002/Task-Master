.PHONY: install run generate push

install:
	bun add
	bun run drizzle-kit
	cp .env.example .env

run:
	bun run dev

generate:
	bun run drizzle-kit generate

push:
	bun run drizzle-kit push

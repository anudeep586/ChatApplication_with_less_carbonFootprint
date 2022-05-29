import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('groups',(table:Knex.TableBuilder)=>{
        table.uuid('id').references('id').inTable('chats').onUpdate('CASCADE').onDelete('CASCADE') ;
        table.uuid('roomdata').notNullable().unique();
        table.uuid('room').primary().notNullable().unique();
        })
}


export async function down(knex: Knex): Promise<void> {
}


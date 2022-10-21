import express from "express";
import "express-async-errors";
import prisma from "./lib/prisma/client"


import {
    validate,
    validationErrorMiddleware,
    colorSchema,
    ColorData
 } from "./lib/validation";

const app = express();

app.use(express.json());

app.get("/colors", async (request, response) => {
const colors = await prisma.colors.findMany();
response.json(colors)
});

app.get("/colors/:id(\\d+)", async (request, response, next) => {
    const colorId = Number(request.params.id)
    const color = await prisma.colors.findUnique({
        where: {id : colorId}});

        if(!color) {
            response.status(404);
            return next(`Cannot GET /colors/${colorId}`)
        }
        response.json(color)
    });


app.post("/colors", validate({ body: colorSchema}), async (request, response) => {
    const colorData : ColorData = request.body;

    const color = await prisma.colors.create({
        data : colorData
    })
    response.status(201).json(color)
    });

app.put("/colors/:id(\\d+)", validate({ body: colorSchema}), async (request, response, next) => {
    const colorId = Number(request.params.id);
    const colorData : ColorData = request.body;

    try{
        const color = await prisma.colors.update({
            where: { id: colorId },
            data : colorData
        });
        response.status(200).json(color)
    } catch(error) {
        response.status(404);
        next(`Cannot PUT /colors/${colorId}`);
    };
});

app.delete("/colors/:id(\\d+)", async (request, response, next) => {
    const colorId = Number(request.params.id);
    try {
        await prisma.colors.delete({
            where: { id: colorId }
        });
        response.status(204).end()
    } catch(error) {
        response.status(404);
        next(`Cannot DELETE /colors/${colorId}`);
    };
});


app.use(validationErrorMiddleware);

export default app;

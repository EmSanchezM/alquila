import { Hono } from "hono";
import { DrizzleExpensesRepository } from "@server/modules/expenses/infrastructure/repositories/DrizzleExpensesRepository";
import {
  CreateExpenseUseCase,
  DeleteExpenseUseCase,
  FindAllExpensesUseCase,
  FindByIdExpensesUseCase,
  UpdateExpenseUseCase,
} from "@server/modules/expenses/application/use-cases";

import { zValidator } from "@server/shared/validator-wrapper";
import { createExpenseSchema, findByIdExpensesSchema, updateExpensesSchema } from "@server/modules/expenses/infrastructure/validations";

const expenseRouter = new Hono();
const expenseRepository = new DrizzleExpensesRepository();

expenseRouter
  .get("/", async (c) => {
    const findAllExpenses = new FindAllExpensesUseCase(expenseRepository);
    const expenses = await findAllExpenses.execute();

    return c.json({
      success: true,
      data: expenses,
    });
  })
  .get("/:id", zValidator('param', findByIdExpensesSchema), async (c) => {
    const findByIdExpense = new FindByIdExpensesUseCase(expenseRepository);
    const expense = await findByIdExpense.execute(c.req.param("id"));

    return c.json({
      success: true,
      data: expense,
    });
  })
  .post("/",  zValidator('json', createExpenseSchema), async (c) => {
    const body = c.req.valid('json');

    const createExpense = new CreateExpenseUseCase(expenseRepository);
    const expense = await createExpense.execute(body);

    return c.json({
      success: true,
      data: expense,
    });
  })
  .put("/:id", zValidator('param', updateExpensesSchema.shape.param), zValidator('json', updateExpensesSchema.shape.body), async (c) => {
    const body = c.req.valid('json');
    const updateExpense = new UpdateExpenseUseCase(expenseRepository);
    const expense = await updateExpense.execute(c.req.param("id"), body);

    return c.json({
      success: true,
      data: expense,
    });
  })
  .delete("/:id", zValidator('param', findByIdExpensesSchema), async (c) => {
    const deleteExpense = new DeleteExpenseUseCase(expenseRepository);
    await deleteExpense.execute(c.req.param("id"));

    return c.json({
      success: true,
      message: "Expense deleted successfully",
    });
  });
export default expenseRouter;
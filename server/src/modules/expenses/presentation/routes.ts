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
import { creatExpenseSchema, findByIdExpensesSchema, updateExpensesSchema } from "@server/modules/expenses/infrastructure/validations";

const expenseRouter = new Hono();
const expenseRepository = new DrizzleExpensesRepository();

expenseRouter
  .get("/", async (c) => {
    try {
      const findAllExpenses = new FindAllExpensesUseCase(expenseRepository);
      const expenses = await findAllExpenses.execute();

      return c.json({
        success: true,
        data: expenses,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .get("/:id", zValidator('param', findByIdExpensesSchema), async (c) => {
    try {
      const findByIdExpense = new FindByIdExpensesUseCase(expenseRepository);
      const expense = await findByIdExpense.execute(c.req.param("id"));

      return c.json({
        success: true,
        data: expense,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .post("/",  zValidator('json', creatExpenseSchema), async (c) => {
    try {
      const body = await c.req.json();

      const createExpense = new CreateExpenseUseCase(expenseRepository);
      const expense = await createExpense.execute(body);

      return c.json({
        success: true,
        data: expense,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .put("/:id", zValidator('json', updateExpensesSchema), async (c) => {
    try {
      const body = await c.req.json();
      const updateExpense = new UpdateExpenseUseCase(expenseRepository);
      const expense = await updateExpense.execute(c.req.param("id"), body);

      return c.json({
        success: true,
        data: expense,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .delete("/:id", zValidator('param', findByIdExpensesSchema), async (c) => {
    try {
      const deleteExpense = new DeleteExpenseUseCase(expenseRepository);
      await deleteExpense.execute(c.req.param("id"));

      return c.json({
        success: true,
        message: "Expense deleted successfully",
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  });
export default expenseRouter;
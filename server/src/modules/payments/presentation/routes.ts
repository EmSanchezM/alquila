import { Hono } from "hono";
import { DrizzlePaymentsRepository } from "@server/modules/payments/infrastructure/repositories/DrizzlePaymentsRepository";
import {
  CreatePaymentUseCase,
  DeletePaymentUseCase,
  FindAllPaymentssUseCase,
  FindByIdPaymentUseCase,
  UpdatePaymentUseCase,
} from "@server/modules/payments/application/use-cases";

import { zValidator } from "@server/shared/validator-wrapper";
import { createPaymentSchema, findByIdPaymentsSchema, updatePaymentsSchema } from "@server/modules/payments/infrastructure/validations";

const paymentRouter = new Hono();
const paymentRepository = new DrizzlePaymentsRepository();

paymentRouter
  .get("/", async (c) => {
    try {
      const findAllPayments = new FindAllPaymentssUseCase(paymentRepository);
      const payments = await findAllPayments.execute();

      return c.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .get("/:id", zValidator('param', findByIdPaymentsSchema), async (c) => {
    try {
      const findByIdPayment = new FindByIdPaymentUseCase(paymentRepository);
      const payment = await findByIdPayment.execute(c.req.param("id"));

      return c.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .post("/",  zValidator('json', createPaymentSchema), async (c) => {
    try {
      const body = await c.req.json();

      const createPayment = new CreatePaymentUseCase(paymentRepository);
      const payment = await createPayment.execute(body);

      return c.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .put("/:id", zValidator('json', updatePaymentsSchema), async (c) => {
    try {
      const body = await c.req.json();
      const updatePayment = new UpdatePaymentUseCase(paymentRepository);
      const payment = await updatePayment.execute(c.req.param("id"), body);

      return c.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  })
  .delete("/:id", zValidator('param', findByIdPaymentsSchema), async (c) => {
    try {
      const deletePayment = new DeletePaymentUseCase(paymentRepository);
      await deletePayment.execute(c.req.param("id"));

      return c.json({
        success: true,
        message: "Payment deleted successfully",
      });
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      }, 400)
    }
  });
export default paymentRouter;
import { Hono } from "hono";
import type { AuthEnv } from "@server/shared/require-auth";
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

const paymentRouter = new Hono<AuthEnv>();
const paymentRepository = new DrizzlePaymentsRepository();

paymentRouter
  .get("/", async (c) => {
    const findAllPayments = new FindAllPaymentssUseCase(paymentRepository);
    const payments = await findAllPayments.execute(c.get("user").id);

    return c.json({
      success: true,
      data: payments,
    });
  })
  .get("/:id", zValidator('param', findByIdPaymentsSchema), async (c) => {
    const findByIdPayment = new FindByIdPaymentUseCase(paymentRepository);
    const payment = await findByIdPayment.execute(c.req.param("id"), c.get("user").id);

    return c.json({
      success: true,
      data: payment,
    });
  })
  .post("/",  zValidator('json', createPaymentSchema), async (c) => {
    const body = c.req.valid('json');

    const createPayment = new CreatePaymentUseCase(paymentRepository);
    const payment = await createPayment.execute(body, c.get("user").id);

    return c.json({
      success: true,
      data: payment,
    });
  })
  .put("/:id", zValidator('param', updatePaymentsSchema.shape.param), zValidator('json', updatePaymentsSchema.shape.body), async (c) => {
    const body = c.req.valid('json');
    const updatePayment = new UpdatePaymentUseCase(paymentRepository);
    const payment = await updatePayment.execute(c.req.param("id"), body, c.get("user").id);

    return c.json({
      success: true,
      data: payment,
    });
  })
  .delete("/:id", zValidator('param', findByIdPaymentsSchema), async (c) => {
    const deletePayment = new DeletePaymentUseCase(paymentRepository);
    await deletePayment.execute(c.req.param("id"), c.get("user").id);

    return c.json({
      success: true,
      message: "Payment deleted successfully",
    });
  });
export default paymentRouter;
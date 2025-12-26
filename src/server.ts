import { createExpressApp } from './infrastructure/http/express';
import { env } from './shared/config/env';

const app = createExpressApp();

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});

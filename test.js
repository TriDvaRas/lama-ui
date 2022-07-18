const { spawnSync } = require("child_process")

const DIP_TEST=`/mnt/c/Users/User/Desktop/lama`
const LAMA_HOME=`/home/conda/lama`
const args = [
    `bin/predict.py`,
    `model.path=${LAMA_HOME}/LaMa_models/big-lama-with-discr/`,
    `indir=${DIP_TEST}/pin/2`,
    `outdir=${DIP_TEST}/pout/bl`,
    `model.checkpoint=best.ckpt`
]
console.log(args);

const result = spawnSync('python3', args, {
    cwd: LAMA_HOME,
    env: {
      ...process.env,
    }
})
console.log(result);
console.log(result.stdout?.toString());
console.log(result.stderr?.toString());
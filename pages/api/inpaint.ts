// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { spawnSync } from 'child_process'
import { writeFileSync } from 'fs'
import Jimp from 'jimp'
import type { NextApiRequest, NextApiResponse } from 'next'
import { env } from 'process'
type Body = {
  image: string
  mask: string
}

type Data = {
  image: string
}
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb' // Set desired value here
    }
  }
}
const IMAGE_HOME = `/mnt/h/git/lama-ui/img`
const LAMA_HOME = `/home/conda/lama/`
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method == 'POST') {

    const body: Body = req.body
    writeFileSync("img/in/image.png", body.image.replace(/^data:image\/.+;base64,/, ""), 'base64')
    const image = await Jimp.read(`img/in/image.png`)
    writeFileSync("img/in/image_mask001.png", body.mask.replace(/^data:image\/png;base64,/, ""), 'base64')
    const mask = await Jimp.read(`img/in/image_mask001.png`)
    if (mask.getWidth() !== image.getWidth()) {
      mask.resize(image.getWidth(), image.getWidth())
      await mask.writeAsync('img/in/image_mask001.png')
    }
    const args = [
      `bin/predict.py`,
      `model.path=${LAMA_HOME}/LaMa_models/big-lama-with-discr/`,
      `indir=${IMAGE_HOME}/in`,
      `outdir=${IMAGE_HOME}/out`,
      `model.checkpoint=best.ckpt`
    ]
    console.log('start');
    
    const result = spawnSync('python3', args, {
      cwd: LAMA_HOME,
      env: {
        ...process.env,
      }
    })
    console.log('end');
    // console.log(result.stdout?.toString());
    // console.log(result.stderr?.toString());
    if (result.status != 0) {
      console.log('err');
      console.log(result.error);
      
      return res.status(500).json({ image: '' })
    }

    res.status(200).json({ image: await (await Jimp.read(`img/out/image_mask001.png`)).getBase64Async(Jimp.AUTO as any) })
  }
}

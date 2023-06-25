const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const { Client, Intents, MessageAttachment } = require('discord.js');

function clearColor(imageData, targetColor, clearColorWhite) {
  const pixels = imageData.data;
  const transpWhite = [255, 255, 255, 0];

  const sRb = 255 * targetColor[0];
  const sGb = 255 * targetColor[1];
  const sBb = 255 * targetColor[2];

  for (let i = 0; i < pixels.length; i += 4) {
    const red = pixels[i];
    const green = pixels[i + 1];
    const blue = pixels[i + 2];
    const alpha = pixels[i + 3];

    if (alpha === 0) {
      if (clearColorWhite) {
        pixels[i] = transpWhite[0];
        pixels[i + 1] = transpWhite[1];
        pixels[i + 2] = transpWhite[2];
        pixels[i + 3] = transpWhite[3];
      }
    } else {
      const Rc = (sRb + alpha * (red - targetColor[0])) / 255;
      const Gc = (sGb + alpha * (green - targetColor[1])) / 255;
      const Bc = (sBb + alpha * (blue - targetColor[2])) / 255;

      let Ac = minimumAlpha(Rc, targetColor[0]);
      Ac = Math.max(Ac, minimumAlpha(Gc, targetColor[1]));
      Ac = Math.max(Ac, minimumAlpha(Bc, targetColor[2]));

      if (Ac === 0) {
        if (clearColorWhite) {
          pixels[i] = transpWhite[0];
          pixels[i + 1] = transpWhite[1];
          pixels[i + 2] = transpWhite[2];
          pixels[i + 3] = transpWhite[3];
        } else {
          pixels[i + 3] = 0;
        }
      } else {
        const newRed = adjustForAlpha(Ac, Rc, targetColor[0], red);
        const newGreen = adjustForAlpha(Ac, Gc, targetColor[1], green);
        const newBlue = adjustForAlpha(Ac, Bc, targetColor[2], blue);

        pixels[i] = newRed;
        pixels[i + 1] = newGreen;
        pixels[i + 2] = newBlue;
        pixels[i + 3] = Ac;
      }
    }
  }

  return imageData;
}

function minimumAlpha(Cc, Cb) {
  if (Cc === Cb) {
    return 0;
  } else if (Cc > Cb) {
    return Math.floor((255 * (Cc - Cb) - 1) / (255 - Cb)) + 1;
  } else {
    return Math.floor((255 * (Cb - Cc - 1)) / Cb) + 1;
  }
}

function adjustForAlpha(Af, Cc, Cb, Cm) {
  const T = 255 * (Cc - Cb) - Af * (Cm - Cb);

  if (T <= -255) {
    return Cm + Math.floor((T + 255) / Af) - 1;
  } else if (T > 0) {
    return Cm + Math.floor((T - 1) / Af) + 1;
  } else {
    return Cm;
  }
}

const token = 'MTExMTgyMTAwMTA4OTYxODA1MA.GKPLGm.x_AVnidd5Ze0fjh4Hvw8nsnsiHc4LQC9D-cb3U';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', async () => {
  console.log('Bot is ready!');

  await client.application.commands.create({
    name: 'colorclear',
    description: 'Color clears the image on black',
    options: [
      {
        name: 'image',
        type: 'ATTACHMENT',
        description: 'The image to color clear',
        required: true,
      },
    ],
    //second command so i dont get confused
    name: 'resize',
    description: 'Resizes the image',
    options: [
      {
        name: 'image',
        type: 'ATTACHMENT',
        description: 'The image to resize',
        required: true,
      },
      {
        name: 'width',
        type: 'INTEGER',
        description: 'The new width of the image',
        required: true,
      },
      {
        name: 'height',
        type: 'INTEGER',
        description: 'The new height of the image',
        required: true,
      },
    ],
  });

  console.log('Slash command registered');
});
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
  
    if (interaction.commandName === 'colorclear') {
      const attachment = interaction.options.get('image').attachment;
  
      if (!attachment) {
        await interaction.reply('Please provide an image to color clear.');
        return;
      }
  
      if (!attachment.name.endsWith('.png')) {
        await interaction.reply('Only PNG files are supported.');
        return;
      }
  
      await interaction.deferReply();
  
      loadImage(attachment.url).then(async (image) => {
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
  
        ctx.drawImage(image, 0, 0);
  
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
        const targetColor = [0, 0, 0]; // black
  
        const clearColorWhite = true;
  
        const modifiedImageData = clearColor(imageData, targetColor, clearColorWhite);
  
        const modifiedCanvas = createCanvas(modifiedImageData.width, modifiedImageData.height);
        const modifiedCtx = modifiedCanvas.getContext('2d');
  
        modifiedCtx.putImageData(modifiedImageData, 0, 0);
  
        const buffer = modifiedCanvas.toBuffer('image/png');
  
        const outputAttachment = new MessageAttachment(buffer, 'output.png');
  
        await interaction.editReply({ files: [outputAttachment] });
      });
    }




    if (interaction.commandName === 'resize') {
        const attachment = interaction.options.get('image').attachment;
        const newWidth = interaction.options.get('width').value;
        const newHeight = interaction.options.get('height').value;
      
        if (!attachment) {
          await interaction.reply('Please provide an image to resize.');
          return;
        }
      
        if (!attachment.name.endsWith('.png')) {
          await interaction.reply('Only PNG files are supported.');
          return;
        }
      
        await interaction.deferReply();
      
        loadImage(attachment.url).then(async (image) => {
          const canvas = createCanvas(newWidth, newHeight);
          const ctx = canvas.getContext('2d');
      
          ctx.drawImage(image, 0, 0, newWidth, newHeight);
      
          const buffer = canvas.toBuffer('image/png');
      
          const outputAttachment = new MessageAttachment(buffer, 'output.png');
      
          await interaction.editReply({ files: [outputAttachment] });
        });
      }

  });
  
  



client.login(token);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');
const mongooseDelete = require('mongoose-delete');
const sanitizeHtml = require('sanitize-html');

const NewdbSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 200,
      trim: true,
    },

    thumbnail: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    body: {
      type: String,
      required: true,
      set: (value) => sanitizeHtml(value, {
        allowedTags: [
          'p','br','b','i','u','strong','em','ul','ol','li','a','img','h1','h2','h3','blockquote','pre','code'
        ],
        allowedAttributes: {
          a: ['href','target','rel'],
          img: ['src','alt','width','height'],
        },
      }),
    },

    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    source: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => {
          if (!v) return true; // cho phép rỗng
          try {
            new URL(v); // Node.js URL parser
            return true;
          } catch {
            return false;
          }
        },
        message: 'Source phải là URL hợp lệ'
      },
    },

    images: {
      type: [String],
      validate: {
        validator: arr => arr.length <= 20,
        message: 'Tối đa 20 ảnh'
      }
    },

    slug: {
      type: String,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

NewdbSchema.pre('save', async function(next) {
  if (!this.slug) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let slug = baseSlug;
    let i = 1;

    while (await mongoose.models.Newdb.exists({ slug })) {
      slug = `${baseSlug}-${i}`;
      i++;
    }

    this.slug = slug;
  }

  next();
});

NewdbSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: 'all',
});

module.exports = mongoose.model('Newdb', NewdbSchema, 'newdbs');

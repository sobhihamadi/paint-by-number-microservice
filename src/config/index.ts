
import dotenv from "dotenv";
import path from "path";


dotenv.config({ path: path.join(__dirname, '../../.env') });

export default {
  env: process.env.NODE_ENV || 'development',
  SECRET: process.env.SECRET,
  storagepath:{

    
    postgres:{
  url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_sAkJNoWI37Tv@ep-silent-violet-ag127b62-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
}
}

};




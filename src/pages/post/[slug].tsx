import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { RichText } from 'prismic-dom';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}



export default function Post({ post }: PostProps) {

  const router = useRouter();
  const { isFallback } = router;
  
 
  const totalWords = post.data.content.reduce((total, contentItem) => {
    total += contentItem.heading.split(' ').length;

    const words = contentItem.body.map(item => item.text.split(' ').length);
    words.map(word => (total += word));
    return total;
  }, 0);

  const readingTime = Math.ceil(totalWords / 200);



  const formattedDate =  format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  )

  return isFallback ? (

    <div>Carregando...</div>
  ) : (

    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>
      
      <img src={post.data.banner.url} alt="imagem" className={styles.banner} />
      <main className={styles.container}>

        <div className={styles.post}>

          <h1>{post.data.title}</h1>

          <ul>
            <li>
              <FiCalendar className={styles.icon} />
              {formattedDate}
            </li>
            <li>
              <FiUser className={styles.icon}/>
              {post.data.author}
            </li>
            <li>
              <FiClock className={styles.icon}/>
              {`${readingTime} min`}
            </li>
          </ul>


        </div>
        
        {post.data.content.map(content => {
          return (
            <article key={content.heading}>
              <h2>{content.heading}</h2>
              <div 
                className={styles.postContent} 
                dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}}>

              </div>
            </article>
          );
        })}
        {console.log(post)}
      </main>
    </>
  );
};

  

export const getStaticPaths: GetStaticPaths = async () => {
  
  const prismic = getPrismicClient();
  //Array retirado apos o query
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'publication')
  ]);

  const paths = postsResponse.results.map((post) => {
    
    return {
      params: {
        slug: post.uid,
      },
    };
  })

  return {
    paths,
    fallback: true,
}
  
};

export const getStaticProps: GetStaticProps = async context => {
  
  const prismic = getPrismicClient();
  const { slug } = context.params;
  const response = await prismic.getByUID('publication', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: RichText.asText(response.data.title),
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body]
        }
      })
    }
  }
  
  return {
    props: {
      post
    }
  }
  
};

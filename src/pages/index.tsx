import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { useState } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}: HomeProps) {
   
  const {next_page, results} = postsPagination;
  const [posts, setPosts] = useState<Post[]>(results);
  const [nextPage, setNextPage] = useState(next_page);

  async function handleLoadNextPage() {

    fetch(nextPage)
      .then(res => res.json())
      .then(data => {
        const loadedPosts = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            }),
            data: {
              title: RichText.asText(post.data.title),
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });
        
        
        const allPosts = [...posts, ...loadedPosts]
        //console.log(allPosts);
        
        setPosts(allPosts)
        setNextPage(data.next_page);
      });

  }
   
   return (

    <>
    <Head>
      <title>Home | Spacetraveling</title>
    </Head>

    <main className={styles.container}>
      <div className={styles.posts}>

        {posts.map(post => (
          <Link  href={`/post/${post.uid}`} key={post.uid}>
            <a>
              <h2>{post.data.title}</h2>
              <h4>{post.data.subtitle}</h4>

              <div className={styles.block}>
                <section className={styles.dateSection}>
                  <span><FiCalendar /></span>
                  <time>{post.first_publication_date}</time>
                </section>

                <section className={styles.userSection}>
                  <span><FiUser /></span>
                  <p>{post.data.author}</p>
                </section>
              </div>

            </a>
          </Link>
        ))}
        {(nextPage)
          ? <button
              className={styles.loadButton}
              onClick={handleLoadNextPage}
            >Carregar mais posts</button>
          : ''}
      </div>
    </main>

 
  </>
  );
}

export const getStaticProps = async () => {

  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([

    Prismic.predicates.at('document.type', 'publication')
  ], {
    fetch: ['publication.title', 'publication.subtitle', 'publication.author'],
    pageSize: 2
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }),
      data: {
        title: RichText.asText(post.data.title),
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  }

  return {
    props: {
      postsPagination,
      },
    }
};

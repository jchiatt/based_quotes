import Hero from "../components/Hero";
import Quote from "../components/Quote";
import Layout from "../components/layout";
import Head from "next/head";

export default function Index({ preview }) {
  return (
    <>
      <Layout preview={preview}>
        <Head>
          <title>Based Quotes</title>
        </Head>
        <Hero />
        <Quote />
      </Layout>
    </>
  );
}

export async function getStaticProps({ preview = false }) {
  return {
    props: { preview },
  };
}

import Layout from "../components/layout";
import Head from "next/head";

export default function Index({ preview }) {
  return (
    <>
      <Layout preview={preview}>
        <Head>
          <title>Based Quotes</title>
        </Head>
        <h1>Based Quotes</h1>
      </Layout>
    </>
  );
}

export async function getStaticProps({ preview = false }) {
  return {
    props: { preview },
  };
}

import neo4j, { Driver, Session, Record } from "neo4j-driver";

class Neo4jService {
  public driver: Driver;
  private isInitialized: boolean = false;

  constructor(
    uri: string | null,
    username: string | null,
    password: string | null,
  ) {
    if (!uri || !username || !password) {
      throw new Error("URI, username, and password must not be null");
    }

    this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
      // Optional configuration for read-only operations
      disableLosslessIntegers: true, // Return native JS numbers instead of Integer objects
      maxTransactionRetryTime: 30000, // 30 seconds retry time
    });

    this.initialize();
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Test the connection by running a simple query
      const session = this.getReadSession();
      await session.run("RETURN 1 as test");
      await session.close();

      this.isInitialized = true;
      console.log("Neo4j connection initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Neo4j connection:", error);
      throw error;
    }
  }

  public getReadSession(database?: string): Session {
    return this.driver.session({
      defaultAccessMode: neo4j.session.READ,
      database: database || undefined, // Use default database if not specified
    });
  }

  public async executeReadQuery(
    query: string,
    parameters: { [key: string]: any } = {},
    database?: string,
  ): Promise<Record[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const session = this.getReadSession(database);

    try {
      const result = await session.run(query, parameters);
      return result.records;
    } catch (error) {
      console.error("Failed to execute read query:", error);
      throw error;
    } finally {
      await session.close();
    }
  }

  public async executeReadTransaction<T>(
    transactionWork: (txc: any) => Promise<T>,
    database?: string,
  ): Promise<T> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const session = this.getReadSession(database);

    try {
      return await session.readTransaction(transactionWork);
    } catch (error) {
      console.error("Failed to execute read transaction:", error);
      throw error;
    } finally {
      await session.close();
    }
  }

  public async verifyConnectivity(): Promise<boolean> {
    try {
      await this.driver.verifyConnectivity();
      return true;
    } catch (error) {
      console.error("Neo4j connectivity verification failed:", error);
      return false;
    }
  }

  public async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      console.log("Neo4j driver closed");
    }
  }

  // Helper method to get server info
  public async getServerInfo(): Promise<any> {
    const session = this.getReadSession();
    try {
      const result = await session.run("CALL dbms.components()");
      return result.records.map((record) => ({
        name: record.get("name"),
        versions: record.get("versions"),
        edition: record.get("edition"),
      }));
    } catch (error) {
      console.error("Failed to get server info:", error);
      throw error;
    } finally {
      await session.close();
    }
  }
}

export const neo4jService = new Neo4jService(
  Deno.env.get("NEO4J_URI") || null,
  Deno.env.get("NEO4J_USERNAME") || null,
  Deno.env.get("NEO4J_PASSWORD") || null,
);

export default Neo4jService;

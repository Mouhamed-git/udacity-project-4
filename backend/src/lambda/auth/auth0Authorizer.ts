import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJXyutkcCQmNPPMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1mNTJxMXRyNy51cy5hdXRoMC5jb20wHhcNMjIxMDAyMTM0NzM5WhcN
MzYwNjEwMTM0NzM5WjAkMSIwIAYDVQQDExlkZXYtZjUycTF0cjcudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqVowPW1ItxbpKTol
i0x4+b5meKUX8phEjyqc4tzogwEZ/kre41VsIGVXHnSlOZB5XrNl8IUBTf53tR1E
H6t3XvpwZlC6COAQ0Q/GbQwzwhtJHxoS0pL3MLPlwatqBjVhWL54EmtmCEWIx6KA
iPlAgUM8+Wm6dhII5BYbmQLGkUUiZTcqR+FO8srLwtt7HJBCwEWzkdg+uFTP0fef
gB37M8GiajqadJc5Ca3WwmaXR/egfdTfwsPPUJVW9ODEji8vABllWZA2kESEw6I5
B9V11oaj7W0E5LQFmMms0/dnwWUXfLcpBl2s143HrD/udZ9l71PhGrX3bPBs3t84
aNGRFwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBR516tu1IFA
Ia1eo55V50EDJb96GjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AAE4Dnz3bxTVdV8qXrWrghAD9A1hpZOCEthA7zyLuCiHZAumH3rG5Mm5a9wsYHLi
dero1J293pb5DG/nFFHPdPetG2NPeEgprvI7+RMT0qzuFGkiFo05IbFGRWj4upFu
6Bp4riIbsNk5A17cAkpyIqUzYSj9gtUa4M2gh/q9njftCY3XBRomNZQ4Hn3zWzHL
UOfglfoMKZRdrccMDSYopObPsY1v1wA2vPFg1YZaVaSlIm7y5RrmAPfd9KAgh/zj
/PN3kqVP/sX1iXqU10/es5gz/87ZwmghiOK7rJaj2Ue5BN6qj+DXsYrZEjJKcR1L
fB8v5Vp/Ljp/C2lV9iGzn5E=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
//  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, jwksUrl, { algorithms:['RS256'] }) as JwtPayload;
}

export function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
